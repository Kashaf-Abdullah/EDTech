const CommunityMessage = require('../models/CommunityMessage');

// Fetch recent community messages (paginated, newest-last for easy chat rendering)
exports.getMessages = async (req, res, next) => {
  try {
    const { before, limit = 50 } = req.query;
    const q = { isDeleted: false };
    if (before) q.createdAt = { $lt: new Date(before) };

    const messages = await CommunityMessage.find(q)
      .populate('sender', 'name profilePic role')
      .populate('reactions.user', 'name')
      .sort('-createdAt')
      .limit(+limit);

    res.json({ success: true, messages: messages.reverse() });
  } catch (err) { next(err); }
};

// Toggle a reaction (REST fallback — primary path is via socket for real-time)
exports.toggleReaction = async (req, res, next) => {
  try {
    const { emoji } = req.body;
    const msg = await CommunityMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });

    const existingIdx = msg.reactions.findIndex(
      r => r.user.toString() === req.user._id.toString() && r.emoji === emoji
    );
    if (existingIdx > -1) {
      msg.reactions.splice(existingIdx, 1); // un-react
    } else {
      msg.reactions.push({ user: req.user._id, emoji });
    }
    await msg.save();
    await msg.populate('reactions.user', 'name');
    res.json({ success: true, reactions: msg.reactions });
  } catch (err) { next(err); }
};

// Admin moderation — soft delete a message
exports.deleteMessage = async (req, res, next) => {
  try {
    const msg = await CommunityMessage.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!msg) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
};
