const router = require('express').Router();
const { protect } = require('../middleware/auth');
const n = require('../controllers/notificationController');
router.get('/',              protect, n.getMyNotifications);
router.patch('/:id/read',    protect, n.markAsRead);
router.patch('/read-all',    protect, n.markAllAsRead);
router.delete('/:id',        protect, n.deleteNotification);
module.exports = router;
