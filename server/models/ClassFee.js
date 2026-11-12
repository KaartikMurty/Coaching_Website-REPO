const { Schema, model } = require('mongoose');
module.exports = model('ClassFee', new Schema({
  cls: { type: String, required: true, unique: true },
  monthlyFee: { type: Number, default: 0, min: 0 }
}));