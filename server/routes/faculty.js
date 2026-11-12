const r = require('express').Router();
const User = require('../models/User');
const { protect, allow, wrap } = require('../middleware/auth');

// Public: only the name and subjects of active teachers that the admin chose to show.
r.get('/', wrap(async (req, res) => {
  const list = await User.find({ role: 'teacher', isActive: { $ne: false }, showOnWebsite: true })
    .select('name subjects').sort('name');
  res.json(list.map(t => ({ name: t.name, subjects: t.subjects || '' })));
}));

// Admin: change what shows on the Faculty page.
r.patch('/:id', protect, allow('admin'), wrap(async (req, res) => {
  const set = {};
  if (typeof req.body.name === 'string' && req.body.name.trim()) set.name = req.body.name.trim();
  if (typeof req.body.subjects === 'string') set.subjects = req.body.subjects.trim().slice(0, 120);
  if (typeof req.body.showOnWebsite === 'boolean') set.showOnWebsite = req.body.showOnWebsite;
  if (!Object.keys(set).length) return res.status(400).json({ message: 'Nothing to change' });
  const result = await User.updateOne({ _id: req.params.id, role: 'teacher' }, { $set: set }, { runValidators: true });
  if (!result.matchedCount) return res.status(404).json({ message: 'Teacher not found' });
  res.json({ ok: true });
}));

module.exports = r;