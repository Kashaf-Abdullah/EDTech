const Notification = require('../models/Notification');

// Helper used by other controllers to create a notification
exports.notify = async (userId, title, message, type = 'system', link = '') => {
  try {
    await Notification.create({ user: userId, title, message, type, link });
  } catch (err) {
    console.error('Notification create failed:', err.message);
  }
};

exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (err) { next(err); }
};

exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (err) { next(err); }
};
