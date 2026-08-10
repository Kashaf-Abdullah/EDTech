const router = require('express').Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/chatController');
const { getSupportContact } = require('../controllers/supportController');

router.get('/access/:userId', protect, c.checkAccessRoute);
router.get('/support',        protect, getSupportContact);
router.post('/start',         protect, c.startConversation);
router.get('/',                protect, c.getMyConversations);
router.get('/:id/messages',    protect, c.getMessages);
router.post('/message',        protect, c.sendMessage);

module.exports = router;
