const express = require('express');
const router = express.Router();
const { Notification, Report } = require('../models');

// List notifications (mapped to frontend-friendly shape)
router.get('/', async (req, res) => {
  try {
    const list = await Notification.findAll({ order: [['created_at','DESC']] });
    const mapped = await Promise.all(list.map(async (n) => {
      let payload = n.payload || {};
      // payload may be stored as a string in some DBs/environments; try parse
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch (err) { payload = {}; }
      }

      // If older notifications only have reportId, try to fetch the report title
      if ((!payload.reportTitle || payload.reportTitle === '') && payload.reportId) {
        try {
          const r = await Report.findByPk(payload.reportId);
          if (r && r.title) payload.reportTitle = r.title;
        } catch (err) {
          // ignore lookup errors and continue
          console.error('[notifications] failed to lookup report title for id', payload.reportId, err && err.message);
        }
      }

      // derive title (prefer explicit payload.title, then reportTitle)
      let title = (payload && payload.title) || (payload && payload.reportTitle) || n.type || 'Notification';
      // derive message
      let message = (payload && payload.message) ? payload.message : '';
      if (!message) {
        if (n.type === 'New Report Submitted') {
          message = `New report submitted${payload.reportTitle ? `: ${payload.reportTitle}` : ''}`;
        } else if (n.type === 'Report Ready for Approval') {
          message = `Report ready for approval${payload.reportTitle ? `: ${payload.reportTitle}` : ''}`;
        } else if (n.type && n.type.startsWith('Report ')) {
          message = payload.status ? `${payload.reportTitle ? `${payload.reportTitle} ` : ''}${payload.status}` : (payload.comments ? String(payload.comments) : JSON.stringify(payload));
        } else {
          message = JSON.stringify(payload || {});
        }
      }

      // map to UI type (success/warning/error/info)
      let uiType = 'info';
      if (String(n.type).toLowerCase().includes('approved')) uiType = 'success';
      else if (String(n.type).toLowerCase().includes('rejected') || String(n.type).toLowerCase().includes('revision')) uiType = 'error';
      else if (String(n.type).toLowerCase().includes('new') || String(n.type).toLowerCase().includes('ready')) uiType = 'warning';

      return {
        id: n.id,
        user_id: n.user_id,
        type: uiType,
        title,
        message,
        time: n.created_at,
        read: !!n.read
      };
    }));

    console.log('[notifications] returning mapped:', mapped.slice(0,10));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all notifications as read (simple endpoint for the demo)
router.post('/mark-read', async (req, res) => {
  try {
    await Notification.update({ read: true }, { where: {} });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
