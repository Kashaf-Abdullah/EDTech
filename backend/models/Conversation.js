const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  // type tells us WHY these two people are allowed to talk
  type: { type: String, enum: ['student_tutor', 'support'], required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // set when type=student_tutor (the enrollment that unlocked the chat)
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
