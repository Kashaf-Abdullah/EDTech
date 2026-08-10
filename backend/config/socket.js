const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const CommunityMessage = require('../models/CommunityMessage');
const { notify } = require('../controllers/notificationController');
const { _checkAccess } = require('../controllers/chatController');
const { filterContactInfo } = require('../utils/contentFilter');

let io;
const onlineUsers = new Map(); // userId -> socketId
const COMMUNITY_ROOM = 'community:global';

function initSocket(server, clientUrl) {
  io = new Server(server, {
    cors: { origin: clientUrl, credentials: true },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token provided'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user || user.isBanned) return next(new Error('Unauthorized'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);
    io.emit('presence:update', { userId, online: true });

    // ── 1-on-1 chat (existing) ──────────────────────────────────────
    socket.on('conversation:join', async (conversationId) => {
      try {
        const convo = await Conversation.findById(conversationId);
        if (!convo || !convo.participants.map(String).includes(userId)) {
          return socket.emit('error:message', 'Not authorized for this conversation');
        }
        socket.join(conversationId);
      } catch (err) {
        socket.emit('error:message', 'Failed to join conversation');
      }
    });

    socket.on('conversation:leave', (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on('message:send', async ({ conversationId, text }) => {
      try {
        if (!text || !text.trim()) return;
        const convo = await Conversation.findById(conversationId);
        if (!convo || !convo.participants.map(String).includes(userId)) {
          return socket.emit('error:message', 'Not authorized for this conversation');
        }
        const otherId = convo.participants.find(p => p.toString() !== userId);
        const access = await _checkAccess(socket.user, otherId);
        if (!access.allowed) {
          return socket.emit('error:message', access.reason || 'Chat access revoked');
        }
        const message = await Message.create({ conversation: conversationId, sender: userId, text: text.trim() });
        convo.lastMessage = text.trim();
        convo.lastMessageAt = new Date();
        await convo.save();
        const populated = await Message.findById(message._id).populate('sender', 'name profilePic role');
        io.to(conversationId).emit('message:new', populated);
        const recipientSocket = onlineUsers.get(otherId.toString());
        if (!recipientSocket) {
          await notify(otherId, `New message from ${socket.user.name}`, text.slice(0, 80), 'system', '/chat');
        }
      } catch (err) {
        socket.emit('error:message', 'Failed to send message');
      }
    });

    socket.on('typing:start', ({ conversationId }) => {
      socket.to(conversationId).emit('typing:update', { userId, typing: true });
    });
    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(conversationId).emit('typing:update', { userId, typing: false });
    });

    // ── Community (group) chat — everyone joins the same global room ──
    socket.on('community:join', () => {
      socket.join(COMMUNITY_ROOM);
    });
    socket.on('community:leave', () => {
      socket.leave(COMMUNITY_ROOM);
    });

    socket.on('community:send', async ({ text }) => {
      try {
        if (!text || !text.trim()) return;
        const raw = text.trim().slice(0, 1000); // hard cap message length

        // Strip/mask any phone numbers or emails before this ever reaches the DB or other users
        const { text: cleanText, wasMasked } = filterContactInfo(raw);

        const msg = await CommunityMessage.create({
          sender: userId,
          text: cleanText,
          originalText: wasMasked ? raw : undefined, // only store the raw version if something was redacted (moderation trail)
          wasMasked,
        });

        const populated = await CommunityMessage.findById(msg._id).populate('sender', 'name profilePic role');

        io.to(COMMUNITY_ROOM).emit('community:new', populated);

        if (wasMasked) {
          // Let the sender know — privately, not in the public room — why part of their message was hidden
          socket.emit('community:notice', 'Phone numbers and email addresses aren\'t allowed in Community and have been hidden for everyone\'s safety.');
        }
      } catch (err) {
        socket.emit('error:message', 'Failed to send message');
      }
    });

    socket.on('community:react', async ({ messageId, emoji }) => {
      try {
        const msg = await CommunityMessage.findById(messageId);
        if (!msg) return;
        const existingIdx = msg.reactions.findIndex(r => r.user.toString() === userId && r.emoji === emoji);
        if (existingIdx > -1) msg.reactions.splice(existingIdx, 1);
        else msg.reactions.push({ user: userId, emoji });
        await msg.save();
        await msg.populate('reactions.user', 'name');
        io.to(COMMUNITY_ROOM).emit('community:reaction', { messageId, reactions: msg.reactions });
      } catch (err) {
        socket.emit('error:message', 'Failed to react');
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('presence:update', { userId, online: false });
    });
  });

  return io;
}

module.exports = { initSocket, getIO: () => io };
