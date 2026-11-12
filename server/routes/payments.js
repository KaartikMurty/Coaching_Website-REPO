const r = require('express').Router();
const { isValidObjectId } = require('mongoose');
const Payment = require('../models/Payment');
const User = require('../models/User');
const ClassFee = require('../models/ClassFee');
const { protect, allow, wrap } = require('../middleware/auth');

r.use(protect);

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const ym = d => d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0');

// Month-by-month fee status for one student, from joining (max 36 months back) to this month.
async function summary(student) {
  const cf = await ClassFee.findOne({ cls: student.cls });
  const due = student.feeOverride ?? (cf ? cf.monthlyFee : 0);
  const pays = await Payment.find({ student: student._id }).sort('paidOn');

  const months = new Set(pays.map(p => p.month));
  const now = new Date();
  const joined = student.joinedAt || student.createdAt || now;
  let d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 35, 1));
  const j = new Date(Date.UTC(joined.getUTCFullYear(), joined.getUTCMonth(), 1));
  if (j > d) d = j;
  for (; d <= now; d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))) months.add(ym(d));

  const rows = [...months].sort().reverse().map(month => {
    const list = pays.filter(p => p.month === month);
    const paid = list.reduce((a, p) => a + p.amount, 0);
    const status = paid <= 0 ? (due === 0 ? 'nofee' : 'unpaid') : (paid >= due ? 'paid' : 'partial');
    return {
      month, due, paid, status,
      payments: list.map(p => ({ id: p._id, amount: p.amount, mode: p.mode, paidOn: p.paidOn, reference: p.reference || '' }))
    };
  });
  return { monthlyFee: due, months: rows };
}

r.get('/mine', allow('student'), wrap(async (req, res) => {
  res.json(await summary(req.user));
}));

r.get('/', allow('admin'), wrap(async (req, res) => {
  if (!isValidObjectId(req.query.student)) return res.status(400).json({ message: 'Choose a student' });
  const s = await User.findOne({ _id: req.query.student, role: 'student' });
  if (!s) return res.status(404).json({ message: 'Student not found' });
  res.json(await summary(s));
}));

r.post('/', allow('admin'), wrap(async (req, res) => {
  const { student, month, amount, mode, paidOn, reference } = req.body;
  const amt = Number(amount);
  const d = paidOn ? new Date(paidOn) : new Date();
  if (!isValidObjectId(student) || typeof month !== 'string' || !MONTH.test(month) || !['cash', 'online'].includes(mode) ||
      !Number.isFinite(amt) || amt <= 0 || amt > 1000000 || isNaN(d) || d > new Date(Date.now() + 864e5))
    return res.status(400).json({ message: 'Check the month, amount, payment type and date' });
  if (!(await User.exists({ _id: student, role: 'student' })))
    return res.status(404).json({ message: 'Student not found' });
  await Payment.create({
    student, month, amount: amt, mode, paidOn: d,
    reference: typeof reference === 'string' ? reference.trim().slice(0, 80) : undefined,
    recordedBy: req.user._id
  });
  res.status(201).json({ ok: true });
}));

// Undo a payment entered by mistake.
r.delete('/:id', allow('admin'), wrap(async (req, res) => {
  await Payment.deleteOne({ _id: req.params.id });
  res.json({ ok: true });
}));

module.exports = r;