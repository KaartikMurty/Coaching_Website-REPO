const r = require('express').Router();
const { isValidObjectId } = require('mongoose');
const Mark = require('../models/Mark');
const User = require('../models/User');
const { protect, allow, wrap } = require('../middleware/auth');

r.use(protect);

r.get('/mine', allow('student'), wrap(async (req, res) => {
  res.json(await Mark.find({ student: req.user._id }).select('-addedBy').sort('-date'));
}));

r.get('/', allow('admin'), wrap(async (req, res) => {
  if (!isValidObjectId(req.query.student)) return res.status(400).json({ message: 'Choose a student' });
  res.json(await Mark.find({ student: req.query.student }).sort('-date'));
}));

r.post('/', allow('admin'), wrap(async (req, res) => {
  const { student, kind, exam, subject, score, outOf, date } = req.body;
  const s = Number(score), o = Number(outOf), d = date ? new Date(date) : new Date();
  if (!isValidObjectId(student) || !['school', 'coaching'].includes(kind) ||
      typeof exam !== 'string' || !exam.trim() || typeof subject !== 'string' || !subject.trim() ||
      !Number.isFinite(s) || !Number.isFinite(o) || o <= 0 || s < 0 || s > o || isNaN(d))
    return res.status(400).json({ message: 'Check the exam, subject, date and marks (marks cannot be more than the total)' });
  if (!(await User.exists({ _id: student, role: 'student' })))
    return res.status(404).json({ message: 'Student not found' });
  const m = await Mark.create({ student, kind, exam, subject, score: s, outOf: o, date: d, addedBy: req.user._id });
  res.status(201).json({ id: m._id });
}));

r.delete('/:id', allow('admin'), wrap(async (req, res) => {
  await Mark.deleteOne({ _id: req.params.id });
  res.json({ ok: true });
}));

module.exports = r;