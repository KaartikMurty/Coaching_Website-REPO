const { Schema, model } = require('mongoose');
module.exports = model('Payment', new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ }, // e.g. 2026-11
  amount: { type: Number, required: true, min: 1 },
  mode: { type: String, enum: ['cash', 'online'], required: true },
  paidOn: { type: Date, default: Date.now },
  reference: { type: String, trim: true, maxlength: 80 }, // e.g. UPI transaction ID
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true }));