const r = require('express').Router();
const ClassFee = require('../models/ClassFee');
const User = require('../models/User');
const { protect, allow, wrap } = require('../middleware/auth');

r.use(protect);

r.get('/', allow('admin'), wrap(async (req, res) => {
  const map = Object.fromEntries((await ClassFee.find()).map(x => [x.cls, x.monthlyFee]));
  res.json(User.CLASSES.map(c => ({ cls: c, monthlyFee: map[c] ?? 0 })));
}));

r.put('/:cls', allow('admin'), wrap(async (req, res) => {
  const fee = Number(req.body.monthlyFee);
  if (!User.CLASSES.includes(req.params.cls) || !Number.isFinite(fee) || fee < 0 || fee > 1000000)
    return res.status(400).json({ message: 'Enter a valid class and fee' });
  await ClassFee.updateOne({ cls: req.params.cls }, { monthlyFee: fee }, { upsert: true });
  res.json({ ok: true });
}));

r.get('/mine', allow('student'), wrap(async (req, res) => {
  const cf = await ClassFee.findOne({ cls: req.user.cls });
  const custom = req.user.feeOverride;
  res.json({ monthlyFee: custom ?? (cf ? cf.monthlyFee : 0), custom: custom != null });
}));

module.exports = r;