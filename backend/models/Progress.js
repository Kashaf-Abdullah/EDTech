const mongoose = require('mongoose');
const progressSchema = new mongoose.Schema({
  student:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course:         { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId }],
  lastWatchedLesson: { type: mongoose.Schema.Types.ObjectId },
  lastWatchedAt:  Date,
  percentage:     { type: Number, default: 0 },
  isCompleted:    { type: Boolean, default: false },
  completedAt:    Date,
}, { timestamps: true });
progressSchema.index({ student: 1, course: 1 }, { unique: true });
module.exports = mongoose.model('Progress', progressSchema);
