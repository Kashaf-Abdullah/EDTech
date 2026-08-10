const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/communityController');

router.get('/',               protect, c.getMessages);
router.post('/:id/react',     protect, c.toggleReaction);
router.delete('/:id',         protect, authorize('admin'), c.deleteMessage);

module.exports = router;
