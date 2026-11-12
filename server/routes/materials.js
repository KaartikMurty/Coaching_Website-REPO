const r = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { isValidObjectId } = require('mongoose');
const Material = require('../models/Material');
const User = require('../models/User');
const { protect, allow, wrap } = require('../middleware/auth');

const ALLOWED = { 'application/pdf': ['.pdf', 'PDF'], 'video/mp4': ['.mp4', 'Video'], 'image/png': ['.png', 'Image'] };
const upload = multer({
  storage: multer.diskStorage({ destination: 'uploads', filename: (q, f, cb) => cb(null, crypto.randomUUID() + ALLOWED[f.mimetype][0]) }),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (q, f, cb) => ALLOWED[f.mimetype] ? cb(null, true) : cb(new Error('Only PDF, MP4 or PNG files are allowed'))
});

r.use(protect);

// A student sees materials for their class that are for everyone, or that name them.
const forStudent = u => ({
  cls: u.cls,
  $or: [{ students: { $exists: false } }, { students: { $size: 0 } }, { students: u._id }]
});

// Names only, so teachers can pick students without seeing phone numbers or addresses.
r.get('/recipients', allow('admin', 'teacher'), wrap(async (req, res) => {
  if (!User.CLASSES.includes(req.query.cls)) return res.json([]);
  res.json(await User.find({ role: 'student', cls: req.query.cls, isActive: { $ne: false } }).select('name').sort('name'));
}));

r.get('/', wrap(async (req, res) => {
  const isStudent = req.user.role === 'student';
  const q = isStudent
    ? forStudent(req.user)
    : (User.CLASSES.includes(req.query.cls) ? { cls: req.query.cls } : {});
  let query = Material.find(q).select('-filePath').sort('-createdAt');
  if (!isStudent) query = query.populate('students', 'name');
  const list = await query;
  // Students are told a material is personal, but never see who else received it.
  res.json(isStudent
    ? list.map(m => { const o = m.toObject(); o.targeted = !!(o.students && o.students.length); delete o.students; return o; })
    : list);
}));

r.post('/', allow('admin', 'teacher'), upload.single('file'), wrap(async (req, res) => {
  const { title, subject, category, cls } = req.body;
  const reject = (code, message) => { if (req.file) fs.unlink(req.file.path, () => {}); return res.status(code).json({ message }); };

  if (!req.file || !title || !subject || !Material.CATEGORIES.includes(category))
    return reject(400, 'Title, subject, type of material and a file are required');
  if (!User.CLASSES.includes(cls)) return reject(400, 'Choose a class');

  const ids = [...new Set([].concat(req.body.students || []).map(String))];
  if (ids.length > 300 || ids.some(id => !isValidObjectId(id))) return reject(400, 'Choose valid students');
  if (ids.length) {
    const found = await User.countDocuments({ _id: { $in: ids }, role: 'student', cls, isActive: { $ne: false } });
    if (found !== ids.length) return reject(400, 'Some selected students were not found in ' + cls);
  }

  const m = await Material.create({
    title, subject, category, cls, students: ids,
    type: ALLOWED[req.file.mimetype][1], fileName: req.file.originalname,
    filePath: req.file.path, uploadedBy: req.user._id
  });
  res.status(201).json({ id: m._id });
}));

r.get('/:id/file', wrap(async (req, res) => {
  const m = await Material.findById(req.params.id);
  if (!m) return res.status(404).json({ message: 'Not found' });
  if (req.user.role === 'student') {
    const personal = m.students && m.students.length > 0;
    if (m.cls !== req.user.cls || (personal && !m.students.some(id => String(id) === String(req.user._id))))
      return res.status(403).json({ message: 'Not allowed' });
  }
  res.download(path.resolve(m.filePath), m.fileName);
}));

r.delete('/:id', allow('admin', 'teacher'), wrap(async (req, res) => {
  const m = await Material.findById(req.params.id);
  if (!m) return res.status(404).json({ message: 'Not found' });
  if (req.user.role === 'teacher' && String(m.uploadedBy) !== String(req.user._id))
    return res.status(403).json({ message: 'You can only delete your own materials' });
  fs.unlink(path.resolve(m.filePath), () => {});
  await m.deleteOne();
  res.json({ ok: true });
}));

module.exports = r;