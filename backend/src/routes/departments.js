const express = require('express');
const router = express.Router();
const { Department } = require('../models');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roles');

// Create department (admin)
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const existing = await Department.findOne({ where: { name } });
    if (existing) return res.status(400).json({ error: 'Department exists' });
    const d = await Department.create({ name });
    res.json(d);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List departments
router.get('/', async (req, res) => {
  try {
    const list = await Department.findAll();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update department (admin)
router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description } = req.body;
    const d = await Department.findByPk(id);
    if (!d) return res.status(404).json({ error: 'Not found' });

    if (!name) return res.status(400).json({ error: 'Name required' });

    // prevent duplicate names
    const existing = await Department.findOne({ where: { name } });
    if (existing && existing.id !== d.id) return res.status(400).json({ error: 'Department name already in use' });

    d.name = name;
    if (typeof description !== 'undefined') d.description = description;
    await d.save();
    res.json(d);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete department (admin)
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const id = req.params.id;
    const d = await Department.findByPk(id);
    if (!d) return res.status(404).json({ error: 'Not found' });
    await d.destroy();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
