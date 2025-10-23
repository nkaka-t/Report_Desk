const express = require('express');
const router = express.Router();
const { User, Department } = require('../models');
const { hash, compare } = require('../utils/hash');
const { sign } = require('../utils/jwt');
const authenticate = require('../middleware/auth');

// Register (admin use)
// Public registration: users can register but cannot assign themselves elevated roles.
// Only an authenticated admin may create users with arbitrary roles (handled elsewhere in Admin UI).
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, role: requestedRole, department_id, team } = req.body;
    if (!email || !password || !full_name) return res.status(400).json({ error: 'Missing fields' });
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'User exists' });
    // default to 'employee' unless the request comes from an admin (we don't accept admin role assignment publicly)
    const role = (requestedRole && requestedRole === 'employee') ? 'employee' : 'employee';
    const password_hash = await hash(password);
    // Resolve department_id: allow numeric id or department name (case-insensitive)
    let deptId = null;
    if (department_id !== undefined && department_id !== null && department_id !== '') {
      if (!isNaN(parseInt(department_id, 10))) {
        deptId = parseInt(department_id, 10);
      } else if (Department) {
        const depts = await Department.findAll();
        const found = depts.find((d) => d.name && d.name.toLowerCase() === String(department_id).toLowerCase());
        if (found) deptId = found.id;
      }
    }

    const user = await User.create({ email, password_hash, full_name, role, department_id: deptId, team });
    res.json({ id: user.id, email: user.email, full_name: user.full_name, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = sign({ id: user.id, role: user.role, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current authenticated user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['id','email','full_name','role','department_id','team'] });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
