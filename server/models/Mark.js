const { Schema, model } = require('mongoose');
module.exports = model('Mark', new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  kind: { type: String, enum: ['school', 'coaching'], required: true },
  exam: { type: String, required: true, trim: true, maxlength: 80 },
  subject: { type: String, required: true, trim: true, maxlength: 60 },
  score: { type: Number, required: true, min: 0 },
  outOf: { type: Number, required: true, min: 1 },
  date: { type: Date, default: Date.now },
  addedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true }));