const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
  student:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course:       { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  entryTest:    { type: mongoose.Schema.Types.ObjectId, ref: 'EntryTest' },
  tutor:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:       { type: Number, required: true },
  platformFee:  { type: Number, default: 0 },
  tutorEarning: { type: Number, default: 0 },
  method:       { type: String, enum: ['stripe','manual'], required: true },
  status:       { type: String, enum: ['pending','approved','rejected','refunded'], default: 'pending' },
  stripePaymentIntentId: String,
  screenshotUrl:  String,
  transactionId:  String,
  bankName:       String,
  adminNote:      String,
  reviewedAt:     Date,
  reviewedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
module.exports = mongoose.model('Payment', paymentSchema);
