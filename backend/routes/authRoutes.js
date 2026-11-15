const router = require('express').Router();
const passport = require('passport');
const { register, login, getMe, updateProfile, googleCallback } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadProfile } = require('../config/cloudinary');

const getGoogleCallbackUrl = (req) => {
  const configured = process.env.GOOGLE_CALLBACK_URL;
  if (configured && !configured.includes('localhost') && !configured.includes('127.0.0.1')) {
    return configured;
  }
  const host = req.get('host');
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'https').split(',')[0].trim();
    return `${proto}://${host}/api/auth/google/callback`;
  }
  return configured || '/api/auth/google/callback';
};

const getClientLoginUrl = () => {
  const clientUrl = (process.env.CLIENT_URL || '').replace(/\/+$/, '');
  return clientUrl ? `${clientUrl}/login` : '/login';
};

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadProfile.single('profilePic'), updateProfile);

router.get('/google', (req, res, next) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    callbackURL: getGoogleCallbackUrl(req),
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', {
    session: false,
    failureRedirect: getClientLoginUrl(),
    callbackURL: getGoogleCallbackUrl(req),
  })(req, res, next);
}, googleCallback);

module.exports = router;
