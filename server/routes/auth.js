const r = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { protect, wrap } = require('../middleware/auth');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { message: 'Too many attempts. Try again in 15 minutes.' } });
const pub = u => ({ id: u._id, name: u.name, email: u.email, role: u.role, cls: u.cls, attendance: u.attendance, tests: u.tests, mustChangePassword: u.mustChangePassword, phone: u.phone, address: u.address, school: u.school, fatherName: u.fatherName, motherName: u.motherName });
r.post('/login', limiter, wrap(async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string')
    return res.status(400).json({ message: 'Email and password are required' });
  const u = await User.findOne({ email: email.toLowerCase().trim() });
  if (!u || !(await bcrypt.compare(password, u.passwordHash)))
    return res.status(401).json({ message: 'Email or password is incorrect' });
  const token = jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: pub(u) });
  if (u.isActive === false)
    return res.status(403).json({ message: 'This account is no longer active. Please contact the center.' });
}));

r.get('/me', protect, (req, res) => res.json({ user: pub(req.user) }));

r.post('/change-password', protect, wrap(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 8)
    return res.status(400).json({ message: 'New password must be at least 8 characters' });
  if (newPassword === currentPassword)
    return res.status(400).json({ message: 'Choose a different password' });
  const u = await User.findById(req.user._id);
  if (!(await bcrypt.compare(currentPassword, u.passwordHash)))
    return res.status(401).json({ message: 'Current password is incorrect' });
  u.passwordHash = await bcrypt.hash(newPassword, 12);
  u.mustChangePassword = false;
  await u.save();
  res.json({ ok: true });
}));

module.exports = r;
