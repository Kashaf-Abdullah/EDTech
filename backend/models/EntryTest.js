const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  options: [{ type: String, required: true, trim: true }],
  correctAnswer: { type: String, required: true, trim: true },
  explanation: { type: String, default: '' },
  isFree: { type: Boolean, default: false },
}, { _id: false });

const entryTestSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  examType: { type: String, enum: ['ECAT', 'MCAT', 'Other'], default: 'Other' },
  subject: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  freeQuestionCount: { type: Number, default: 20 },
  price: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  questions: [questionSchema],
  totalAttempts: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('EntryTest', entryTestSchema);
