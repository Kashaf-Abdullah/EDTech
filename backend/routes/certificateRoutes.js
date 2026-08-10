const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getMyCertificates, getCertificate } = require('../controllers/certificateController');
router.get('/',        protect, getMyCertificates);
router.get('/:certId', getCertificate); // public — no auth, so a shared link/QR works for anyone verifying
module.exports = router;
