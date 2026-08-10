const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const p = require('../controllers/entryTestController');

router.get('/', protect, p.getEntryTests);
router.post('/admin', protect, authorize('admin'), p.createEntryTest);
router.get('/admin', protect, authorize('admin'), p.getAdminEntryTests);
router.get('/admin/unlocks', protect, authorize('admin'), p.getAdminUnlockRequests);
router.patch('/admin/unlocks/:id', protect, authorize('admin'), p.reviewEntryTestUnlock);
router.get('/admin/:id', protect, authorize('admin'), p.getEntryTestById);
router.patch('/admin/:id', protect, authorize('admin'), p.updateEntryTest);
router.delete('/admin/:id', protect, authorize('admin'), p.deleteEntryTest);
router.patch('/admin/:id/toggle', protect, authorize('admin'), p.toggleEntryTestPublish);
router.post('/:id/unlock', protect, p.unlockEntryTest);
router.post('/:id/start', protect, p.startAttempt);
router.post('/attempts/:attemptId/submit', protect, p.submitAttempt);
router.get('/attempts/my', protect, p.getMyAttempts);

module.exports = router;
