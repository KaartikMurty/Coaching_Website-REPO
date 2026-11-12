const { Schema, model } = require('mongoose');
const CATEGORIES = ['Notes', 'Test paper', 'Homework', 'Worksheet', 'Syllabus', 'Other'];

const Material = model('Material', new Schema({
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  cls: { type: String, required: true, index: true },
  type: { type: String, enum: ['PDF', 'Video', 'Image'] },
  category: { type: String, enum: CATEGORIES, default: 'Notes' },
  students: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], index: true },
  fileName: String,
  filePath: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true }));

Material.CATEGORIES = CATEGORIES;
module.exports = Material;