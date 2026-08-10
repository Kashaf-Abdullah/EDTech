const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emoji: { type: String, required: true }, // e.g. '👍', '❤️', '😂', '🎉', '👏', '🤔'
}, { _id: false });

const communityMessageSchema = new mongoose.Schema({
  sender:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:          { type: String, required: true },       // sanitized text actually shown
  originalText:  { type: String },                        // raw text before masking, kept for admin moderation only
  wasMasked:     { type: Boolean, default: false },        // true if phone/email was detected & redacted
  reactions:     [reactionSchema],
  isDeleted:     { type: Boolean, default: false },
}, { timestamps: true });

communityMessageSchema.index({ createdAt: 1 });

module.exports = mongoose.model('CommunityMessage', communityMessageSchema);
