const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadProfile } = require('../config/cloudinary');
const multer = require('multer');
const { getSettings, updateSettings } = require('../controllers/settingsController');

const upload = multer({ storage: uploadProfile.storage }).fields([
  { name: 'signature', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
]);

router.get('/',  protect, getSettings); // anyone logged-in can read (needed to render certificates)
router.put('/',  protect, authorize('admin'), upload, updateSettings);

module.exports = router;
