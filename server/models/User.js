const { Schema, model } = require('mongoose');
const CLASSES = ['Nursery', 'LKG', 'UKG', ...Array.from({ length: 12 }, (_, i) => 'Class ' + (i + 1))];
const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  cls: { type: String, enum: CLASSES },
  attendance: { type: Number, default: 100 },
  subjects: { type: String, trim: true, maxlength: 120 },
  showOnWebsite: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  joinedAt: { type: Date, default: Date.now },
  leftAt: Date,
  phone: { type: String, trim: true, maxlength: 20 },
  address: { type: String, trim: true, maxlength: 200 },
  school: { type: String, trim: true, maxlength: 100 },
  fatherName: { type: String, trim: true, maxlength: 100 },
  motherName: { type: String, trim: true, maxlength: 100 },
  feeOverride: { type: Number, min: 0 },
  tests: [{ subject: String, score: Number }],
  mustChangePassword: { type: Boolean, default: false }
}, { timestamps: true });
const User = model('User', userSchema);
User.CLASSES = CLASSES;
module.exports = User;
