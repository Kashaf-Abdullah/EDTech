const mongoose = require('mongoose');
const sessionSchema = new mongoose.Schema({
  tutor:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:     { type: Date, required: true },
  duration: { type: Number, default: 60 },
  subject:  String,
  status:   { type: String, enum: ['pending','confirmed','completed','cancelled','rescheduled'], default: 'pending' },
  zoomLink: String,
  price:    { type: Number, default: 0 },
  payment:  { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  notes:    String,
  cancelReason: String,
}, { timestamps: true });
module.exports = mongoose.model('Session', sessionSchema);
