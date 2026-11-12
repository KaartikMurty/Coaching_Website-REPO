const r = require('express').Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { protect, allow, wrap } = require('../middleware/auth');

r.use(protect, allow('admin'));

r.get('/', wrap(async (req, res) => {
  const q = { role: 'student' };
  if (User.CLASSES.includes(req.query.cls)) q.cls = req.query.cls;
  res.json(await User.find(q).select('-passwordHash').sort('cls name'));
}));

r.post('/', wrap(async (req, res) => {
  const { name, email, cls } = req.body;
  if (typeof name !== 'string' || typeof email !== 'string' || !User.CLASSES.includes(cls))
    return res.status(400).json({ message: 'Name, email and a valid class are required' });
  const tempPassword = crypto.randomBytes(5).toString('hex');
  const u = await User.create({ name, email, cls, role: 'student', passwordHash: await bcrypt.hash(tempPassword, 12), mustChangePassword: true });
  res.status(201).json({ id: u._id, tempPassword });
}));

r.delete('/:id', wrap(async (req, res) => {
  await User.deleteOne({ _id: req.params.id, role: 'student' });
  res.json({ ok: true });
}));

module.exports = r;
