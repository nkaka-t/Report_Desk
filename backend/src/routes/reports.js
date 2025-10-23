const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const models = require('../models');
const { Report, ReportType, ReviewHistory, User, Notification, Department } = models;
const sequelize = models.sequelize;
const { Op } = require('sequelize');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const { createNotification } = require('../utils/notify');

const uploadDir = path.join(process.cwd(), 'reports_uploads');
// ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // double-check at runtime
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Submit report (employee)
router.post('/submit', authenticate, requireRole('employee','admin'), upload.single('file'), async (req, res) => {
  try {
    // log incoming request for debugging
    console.log('[reports] submit by user=', req.user && req.user.id);
    console.log('[reports] body=', req.body);
    console.log('[reports] file=', req.file && { originalname: req.file.originalname, path: req.file.path, size: req.file.size });

  let { report_type_id, due_date, title, description } = req.body;
    const file_path = req.file ? req.file.path : null;

    // normalize report_type_id: allow numeric id or name; if not found, null to avoid FK errors
    let resolvedReportType = null;
    if (report_type_id !== undefined && report_type_id !== null && String(report_type_id).trim() !== '') {
      const parsed = parseInt(String(report_type_id), 10);
      if (!isNaN(parsed)) {
        resolvedReportType = await ReportType.findByPk(parsed);
        if (!resolvedReportType) report_type_id = null;
      } else {
        // try find by name
        resolvedReportType = await ReportType.findOne({ where: { name: String(report_type_id) } });
        report_type_id = resolvedReportType ? resolvedReportType.id : null;
      }
    } else {
      report_type_id = null;
    }

    // If client provided a report_type_id but we couldn't resolve it, return a clear error
    if ((req.body.report_type_id !== undefined) && (report_type_id === null)) {
      console.error('[reports] Invalid report_type_id provided:', req.body.report_type_id);
      return res.status(400).json({ error: 'Invalid report type' });
    }

    // coerce due_date if provided
    if (due_date) {
      const d = new Date(due_date);
      if (!isNaN(d.getTime())) due_date = d.toISOString().split('T')[0]; // store as DATEONLY
      else due_date = null;
    }

  const report = await Report.create({ user_id: req.user.id, report_type_id, file_path, due_date, status: 'Pending', submitted_at: new Date(), title, description });
    // notify department reviewer(s) - simplistic: notify first reviewer in same department
    const rt = resolvedReportType || (report.report_type_id ? await ReportType.findByPk(report.report_type_id) : null);
      if (rt) {
        const reviewer = await User.findOne({ where: { role: 'reviewer', department_id: rt.department_id } });
    if (reviewer) await createNotification({ user_id: reviewer.id, type: 'New Report Submitted', payload: { reportId: report.id, reportTitle: title || report.title || '', from: req.user.id, toEmail: reviewer.email, title: 'New Report Submitted', message: `${req.user.full_name || 'A user'} submitted a new report: ${title || report.title || `#${report.id}`}` }, sendEmail: false });
      }
  res.json(report);
  } catch (err) {
    console.error(err);
    // surface the error message in development to help debugging
    res.status(500).json({ error: err && err.message ? String(err.message) : 'Server error' });
  }
});

// List reports (supports optional ?status=pending|reviewed|approved)
router.get('/', async (req, res) => {
  try {
    const { status, q } = req.query;
    const where = {};
    if (status) {
      // normalize: frontend may send lowercase
      const s = String(status).toLowerCase();
      if (s === 'pending') where.status = 'Pending';
      if (s === 'reviewed') where.status = 'Reviewed';
      if (s === 'approved') where.status = 'Approved';
      if (s === 'rejected') where.status = 'Rejected';
    }
    // add full-text-ish search across title, description, and submitter full_name
    if (q && String(q).trim() !== '') {
      const val = String(q).trim();
      // Use case-insensitive search: Postgres supports iLike, sqlite does not
      const dialect = sequelize.getDialect && sequelize.getDialect();
      if (dialect === 'postgres') {
        const ilike = `%${val}%`;
        where[Op.or] = [
          { title: { [Op.iLike]: ilike } },
          { description: { [Op.iLike]: ilike } },
          { '$User.full_name$': { [Op.iLike]: ilike } }
        ];
      } else {
        const like = `%${val.toLowerCase()}%`;
        where[Op.or] = [
          sequelize.where(sequelize.fn('lower', sequelize.col('title')), { [Op.like]: like }),
          sequelize.where(sequelize.fn('lower', sequelize.col('description')), { [Op.like]: like }),
          sequelize.where(sequelize.fn('lower', sequelize.col("User.full_name")), { [Op.like]: like })
        ];
      }
    }

    const list = await Report.findAll({
      where,
      order: [['created_at','DESC']],
      include: [
        { model: User, attributes: ['id','full_name','email','department_id'] },
        { model: ReportType, include: [{ model: Department }] }
      ]
    });
    // map to frontend-friendly shape
    const mapped = list.map((r) => ({
      id: r.id,
      title: r.title || '',
      description: r.description || '',
      department: r.ReportType && r.ReportType.Department ? r.ReportType.Department.name : (r.User ? r.User.department_id : ''),
      type: r.ReportType ? r.ReportType.name : '',
      dueDate: r.due_date || null,
      status: r.status,
      submittedDate: r.submitted_at,
      submittedBy: r.User ? r.User.full_name : null,
      filePath: r.file_path,
      reviewedBy: r.reviewed_by || null,
      reviewedDate: r.reviewed_at || null,
      reviewComments: r.review_comments || null,
      approvedBy: r.approved_by || null,
      approvedDate: r.approved_at || null,
      approvalComments: r.approval_comments || null,
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reviewer queue: pending reports for reviewer's department
router.get('/review-queue', authenticate, requireRole('reviewer','admin'), async (req, res) => {
  try {
    const reviewer = req.user;
    const list = await Report.findAll({
      where: { status: 'Pending' },
      include: [ { model: User, attributes: ['id','full_name','email','department_id'] }, { model: ReportType, include: [{ model: Department }] } ],
      order: [['created_at','DESC']]
    });
    const filtered = list.filter(r => {
      if (!r.ReportType || !reviewer.department_id) return true;
      return r.ReportType.department_id === reviewer.department_id;
    });
    const mapped = filtered.map((r) => ({
      id: r.id,
      title: r.title || '',
      description: r.description || '',
      department: r.ReportType && r.ReportType.Department ? r.ReportType.Department.name : (r.User ? r.User.department_id : ''),
      type: r.ReportType ? r.ReportType.name : '',
      dueDate: r.due_date || null,
      status: r.status,
      submittedDate: r.submitted_at,
      submittedBy: r.User ? r.User.full_name : null,
      filePath: r.file_path
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approver queue: reports with status Reviewed
router.get('/approval-queue', authenticate, requireRole('approver','admin'), async (req, res) => {
  try {
    const list = await Report.findAll({
      where: { status: 'Reviewed' },
      include: [ { model: User, attributes: ['id','full_name','email'] }, { model: ReportType, include: [{ model: Department }] } ],
      order: [['created_at','DESC']]
    });
    const mapped = list.map((r) => ({
      id: r.id,
      title: r.title || '',
      description: r.description || '',
      department: r.ReportType && r.ReportType.Department ? r.ReportType.Department.name : (r.User ? r.User.department_id : ''),
      type: r.ReportType ? r.ReportType.name : '',
      dueDate: r.due_date || null,
      status: r.status,
      submittedDate: r.submitted_at,
      submittedBy: r.User ? r.User.full_name : null,
      filePath: r.file_path
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single report
router.get('/:id', async (req, res) => {
  try {
    const r = await Report.findByPk(req.params.id, { include: [{ model: User, attributes: ['id','full_name','email','department_id'] }, { model: ReportType, include: [{ model: Department }] }] });
    if (!r) return res.status(404).json({ error: 'Not found' });
    const mapped = {
      id: r.id,
      title: r.title || '',
      description: r.description || '',
      department: r.ReportType && r.ReportType.Department ? r.ReportType.Department.name : (r.User ? r.User.department_id : ''),
      type: r.ReportType ? r.ReportType.name : '',
      dueDate: r.due_date || null,
      status: r.status,
      submittedDate: r.submitted_at,
      submittedBy: r.User ? r.User.full_name : null,
      filePath: r.file_path
    };
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Download report metadata as a PDF
router.get('/:id/download', async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id, { include: [{ model: User, attributes: ['id','full_name','email'] }, { model: ReportType, include: [] }] });
    if (!report) return res.status(404).json({ error: 'Not found' });

    // Generate PDF containing only report metadata
    // NOTE: requires `pdfkit` to be installed in the backend (npm install pdfkit)
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Stream PDF to response
    const filenameSafe = (report.title || `report-${report.id}`).replace(/[^a-z0-9_.-]/gi, '_') + '.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filenameSafe}"`);
    doc.pipe(res);

    doc.fontSize(20).text(report.title || `Report #${report.id}`, { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(`Submitted by: ${report.User ? report.User.full_name : report.user_id}`);
    doc.text(`Submitted at: ${report.submitted_at ? new Date(report.submitted_at).toLocaleString() : '—'}`);
    if (report.due_date) doc.text(`Due date: ${report.due_date}`);
    doc.text(`Status: ${report.status || '—'}`);
    doc.moveDown();

    doc.fontSize(14).text('Description:', { underline: true });
    doc.fontSize(12).text(report.description || '—');
    doc.moveDown();

    doc.fontSize(12).text('Review / Approval:', { underline: true });
    doc.text(`Reviewed by: ${report.reviewed_by || '—'}`);
    doc.text(`Reviewed at: ${report.reviewed_at ? new Date(report.reviewed_at).toLocaleString() : '—'}`);
    doc.text(`Review comments: ${report.review_comments || '—'}`);
    doc.moveDown();
    doc.text(`Approved by: ${report.approved_by || '—'}`);
    doc.text(`Approved at: ${report.approved_at ? new Date(report.approved_at).toLocaleString() : '—'}`);
    doc.text(`Approval comments: ${report.approval_comments || '—'}`);

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update report (e.g., change due_date, title, etc.)
router.put('/:id', authenticate, requireRole('employee','admin'), async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: 'Not found' });
    const fields = ['title','due_date','status','report_type_id'];
    fields.forEach(f => { if (req.body[f] !== undefined) report[f] = req.body[f]; });
    await report.save();
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete report
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: 'Not found' });
    await report.destroy();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reviewer action: review and forward
router.post('/:id/review', authenticate, requireRole('reviewer','admin'), async (req, res) => {
  try {
    const { action, comments } = req.body; // action: Reviewed/Request Revisions/Rejected
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: 'Not found' });
    await ReviewHistory.create({ report_id: report.id, reviewer_id: req.user.id, action, comments });
    // update status and reviewer meta
    if (action === 'Reviewed') {
      report.status = 'Reviewed';
      report.reviewed_by = req.user.id;
      report.reviewed_at = new Date();
      report.review_comments = comments || null;
      // notify approver(s)
      const approver = await User.findOne({ where: { role: 'approver' } });
  if (approver) await createNotification({ user_id: approver.id, type: 'Report Ready for Approval', payload: { reportId: report.id, reportTitle: report.title || '', from: req.user.id, toEmail: approver.email, title: 'Report Ready for Approval', message: `${req.user.full_name || 'A reviewer'} forwarded report for approval: ${report.title || `#${report.id}`}` }, sendEmail: false });
    } else if (action === 'Rejected') {
      report.status = 'Rejected';
      report.reviewed_by = req.user.id;
      report.reviewed_at = new Date();
      report.review_comments = comments || null;
    } else {
      // request revisions -> stay pending and store comments
      report.status = 'Pending';
      report.review_comments = comments || null;
    }
    await report.save();
    res.json({ ok: true, status: report.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approver action
router.post('/:id/approve', authenticate, requireRole('approver','admin'), async (req, res) => {
  try {
    const { action, comments } = req.body; // action: Approved/Rejected
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: 'Not found' });
    await ReviewHistory.create({ report_id: report.id, reviewer_id: req.user.id, action, comments });
    report.status = action === 'Approved' ? 'Approved' : 'Rejected';
    report.approved_by = req.user.id;
    report.approved_at = new Date();
    report.approval_comments = comments || null;
    await report.save();
    // notify original submitter
    const submitter = await User.findByPk(report.user_id);
  if (submitter) await createNotification({ user_id: submitter.id, type: `Report ${report.status}`, payload: { reportId: report.id, reportTitle: report.title || '', status: report.status, comments, title: `Report ${report.status}`, message: `Your report ${report.title || `#${report.id}`} status is now ${report.status}` }, sendEmail: false });
    res.json({ ok: true, status: report.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
