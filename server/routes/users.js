const r = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ClassFee = require('../models/ClassFee');
const Mark = require('../models/Mark');
const { protect, allow, wrap } = require('../middleware/auth');

r.use(protect, allow('admin'));

const LIMITS = { phone: 20, address: 200, school: 100, fatherName: 100, motherName: 100 };
const cleanFee = v => { const n = Number(v); return Number.isFinite(n) && n >= 0 && n <= 1000000 ? n : null; };
const parseDate = v => { const d = new Date(v); return isNaN(d) || d > new Date(Date.now() + 864e5) ? null : d; };

r.get('/', wrap(async (req, res) => {
  const role = req.query.role === 'teacher' ? 'teacher' : 'student';
  const q = { role, isActive: req.query.status === 'left' ? false : { $ne: false } };
  if (role === 'student' && User.CLASSES.includes(req.query.cls)) q.cls = req.query.cls;
  const fees = Object.fromEntries((await ClassFee.find()).map(x => [x.cls, x.monthlyFee]));
  const list = await User.find(q).select('-passwordHash').sort('cls name').lean();
  res.json(list.map(u => ({
    ...u,
    joinedAt: u.joinedAt || u.createdAt,
    fee: role === 'student' ? (u.feeOverride ?? fees[u.cls] ?? 0) : undefined
  })));
}));

r.post('/', wrap(async (req, res) => {
  const { name, email, password, role, cls } = req.body;
  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || typeof password !== 'string')
    return res.status(400).json({ message: 'Name, email and password are required' });
  if (!['student', 'teacher'].includes(role))
    return res.status(400).json({ message: 'Role must be student or teacher' });
  if (role === 'student' && !User.CLASSES.includes(cls))
    return res.status(400).json({ message: 'Choose a class for the student' });
  if (password.length < 8)
    return res.status(400).json({ message: 'Password must be at least 8 characters' });

  let joinedAt = new Date();
  if (req.body.joinedAt) {
    joinedAt = parseDate(req.body.joinedAt);
    if (!joinedAt) return res.status(400).json({ message: 'Enter a valid joining date' });
  }
  const extra = {};
  if (role === 'student') {
    for (const [f, max] of Object.entries(LIMITS))
      if (typeof req.body[f] === 'string' && req.body[f].trim()) extra[f] = req.body[f].trim().slice(0, max);
    const fo = req.body.feeOverride;
    if (fo !== undefined && fo !== '' && fo !== null) {
      const fee = cleanFee(fo);
      if (fee === null) return res.status(400).json({ message: 'Enter a valid fee' });
      extra.feeOverride = fee;
    }
  }
  if (role === 'teacher') {
    if (typeof req.body.subjects === 'string' && req.body.subjects.trim()) extra.subjects = req.body.subjects.trim().slice(0, 120);
    extra.showOnWebsite = req.body.showOnWebsite === 'on' || req.body.showOnWebsite === true;
  }
  const u = await User.create({
    name, email, role, joinedAt, ...extra,
    cls: role === 'student' ? cls : undefined,
    passwordHash: await bcrypt.hash(password, 12),
    mustChangePassword: true
  });
  res.status(201).json({ id: u._id });
}));

r.patch('/:id', wrap(async (req, res) => {
  const set = {}, unset = {};
  if (typeof req.body.name === 'string' && req.body.name.trim()) set.name = req.body.name.trim();
  for (const [f, max] of Object.entries(LIMITS))
    if (typeof req.body[f] === 'string') set[f] = req.body[f].trim().slice(0, max);
  if (User.CLASSES.includes(req.body.cls)) set.cls = req.body.cls;
  if (req.body.joinedAt) {
    const d = parseDate(req.body.joinedAt);
    if (!d) return res.status(400).json({ message: 'Enter a valid joining date' });
    set.joinedAt = d;
  }
  const fo = req.body.feeOverride;
  if (fo === '' || fo === null) unset.feeOverride = '';
  else if (fo !== undefined) {
    const fee = cleanFee(fo);
    if (fee === null) return res.status(400).json({ message: 'Enter a valid fee' });
    set.feeOverride = fee;
  }
  const update = {};
  if (Object.keys(set).length) update.$set = set;
  if (Object.keys(unset).length) update.$unset = unset;
  if (!Object.keys(update).length) return res.status(400).json({ message: 'Nothing to change' });
  const result = await User.updateOne({ _id: req.params.id, role: 'student' }, update, { runValidators: true });
  if (!result.matchedCount) return res.status(404).json({ message: 'Student not found' });
  res.json({ ok: true });
}));

r.patch('/:id/password', wrap(async (req, res) => {
  const { password } = req.body;
  if (typeof password !== 'string' || password.length < 8)
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  const result = await User.updateOne(
    { _id: req.params.id, role: { $in: ['student', 'teacher'] } },
    { passwordHash: await bcrypt.hash(password, 12), mustChangePassword: true }
  );
  if (!result.matchedCount) return res.status(404).json({ message: 'User not found' });
  res.json({ ok: true });
}));

// Mark as left: blocks login and records the leaving date (today unless the admin picks another)
r.patch('/:id/leave', wrap(async (req, res) => {
  const d = req.body.leftAt ? parseDate(req.body.leftAt) : new Date();
  if (!d) return res.status(400).json({ message: 'Enter a valid leaving date' });
  const result = await User.updateOne(
    { _id: req.params.id, role: { $in: ['student', 'teacher'] } },
    { $set: { isActive: false, leftAt: d } }
  );
  if (!result.matchedCount) return res.status(404).json({ message: 'User not found' });
  res.json({ ok: true });
}));

r.patch('/:id/restore', wrap(async (req, res) => {
  const result = await User.updateOne(
    { _id: req.params.id, role: { $in: ['student', 'teacher'] } },
    { $set: { isActive: true }, $unset: { leftAt: '' } }
  );
  if (!result.matchedCount) return res.status(404).json({ message: 'User not found' });
  res.json({ ok: true });
}));

// Permanent delete, only for people already marked as left. Also removes the student's marks.
r.delete('/:id', wrap(async (req, res) => {
  const u = await User.findOneAndDelete({ _id: req.params.id, role: { $in: ['student', 'teacher'] }, isActive: false });
  if (u) await Mark.deleteMany({ student: u._id });
  res.json({ ok: true });
}));

module.exports = r;