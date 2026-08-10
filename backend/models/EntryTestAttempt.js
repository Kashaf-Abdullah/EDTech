const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'EntryTest', required: true },
  answers: [{ type: String }],
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  completedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
}, { timestamps: true });

module.exports = mongoose.model('EntryTestAttempt', attemptSchema);
