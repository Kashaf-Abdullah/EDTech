const Conversation = require('../models/Conversation');
const Message      = require('../models/Message');
const User         = require('../models/User');
const Enrollment   = require('../models/Enrollment');
const Course       = require('../models/Course');
const { notify }   = require('./notificationController');

// Core rule check: can `me` open a chat with `otherUserId`?
// - admin <-> anyone: always allowed
// - student <-> tutor: allowed only if student is enrolled in one of that tutor's courses
// - same role (student<->student, tutor<->tutor): never allowed
const checkAccess = async (me, otherUserId) => {
  const other = await User.findById(otherUserId);
  if (!other) return { allowed: false, reason: 'User not found' };

  if (me.role === 'admin' || other.role === 'admin') {
    return { allowed: true, type: 'support', course: null };
  }

  if (me.role === 'student' && other.role === 'tutor') {
    const tutorCourses = await Course.find({ tutor: other._id }).select('_id');
    const courseIds = tutorCourses.map(c => c._id);
    const enrollment = await Enrollment.findOne({ student: me._id, course: { $in: courseIds } }).populate('course', 'title');
    if (!enrollment) return { allowed: false, reason: 'You must enroll in this tutor\'s course to chat with them.' };
    return { allowed: true, type: 'student_tutor', course: enrollment.course._id };
  }

  if (me.role === 'tutor' && other.role === 'student') {
    const myCourses = await Course.find({ tutor: me._id }).select('_id');
    const courseIds = myCourses.map(c => c._id);
    const enrollment = await Enrollment.findOne({ student: other._id, course: { $in: courseIds } }).populate('course', 'title');
    if (!enrollment) return { allowed: false, reason: 'This student is not enrolled in any of your courses.' };
    return { allowed: true, type: 'student_tutor', course: enrollment.course._id };
  }

  return { allowed: false, reason: 'Chat not allowed between these roles.' };
};

// Start (or fetch existing) conversation with a user
exports.startConversation = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (userId === req.user._id.toString()) return res.status(400).json({ success:false, message:"Can't chat with yourself" });

    const access = await checkAccess(req.user, userId);
    if (!access.allowed) return res.status(403).json({ success:false, message: access.reason });

    let convo = await Conversation.findOne({
      participants: { $all: [req.user._id, userId], $size: 2 },
      type: access.type,
    });

    if (!convo) {
      convo = await Conversation.create({
        participants: [req.user._id, userId],
        type: access.type,
        course: access.course,
      });
    }

    await convo.populate('participants', 'name profilePic role');
    res.status(201).json({ success:true, conversation: convo });
  } catch(err) { next(err); }
};

// List all conversations for logged-in user
exports.getMyConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name profilePic role')
      .populate('course', 'title')
      .sort('-lastMessageAt');

    // attach unread count per conversation
    const withUnread = await Promise.all(conversations.map(async (c) => {
      const unread = await Message.countDocuments({ conversation: c._id, sender: { $ne: req.user._id }, isRead: false });
      return { ...c.toObject(), unreadCount: unread };
    }));

    res.json({ success:true, conversations: withUnread });
  } catch(err) { next(err); }
};

// Get messages in a conversation (also marks them read)
exports.getMessages = async (req, res, next) => {
  try {
    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ success:false, message:'Conversation not found' });
    if (!convo.participants.map(String).includes(req.user._id.toString()))
      return res.status(403).json({ success:false, message:'Forbidden' });

    const messages = await Message.find({ conversation: req.params.id }).sort('createdAt').populate('sender','name profilePic role');

    await Message.updateMany({ conversation: req.params.id, sender: { $ne: req.user._id }, isRead: false }, { isRead: true });

    res.json({ success:true, messages });
  } catch(err) { next(err); }
};

// Send a message (used by REST fallback; primary path is via socket)
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, text } = req.body;
    const convo = await Conversation.findById(conversationId);
    if (!convo) return res.status(404).json({ success:false, message:'Conversation not found' });
    if (!convo.participants.map(String).includes(req.user._id.toString()))
      return res.status(403).json({ success:false, message:'Forbidden' });

    const message = await Message.create({ conversation: conversationId, sender: req.user._id, text });
    convo.lastMessage = text;
    convo.lastMessageAt = new Date();
    await convo.save();
    await message.populate('sender','name profilePic role');

    const recipientId = convo.participants.find(p => p.toString() !== req.user._id.toString());
    await notify(recipientId, `New message from ${req.user.name}`, text.slice(0,80), 'system', '/chat');

    res.status(201).json({ success:true, message });
  } catch(err) { next(err); }
};

// Check if current user is allowed to chat with a given user (used by frontend before showing "Message" button)
exports.checkAccessRoute = async (req, res, next) => {
  try {
    const access = await checkAccess(req.user, req.params.userId);
    res.json({ success:true, ...access });
  } catch(err) { next(err); }
};

exports._checkAccess = checkAccess; // exported for socket.js to reuse
