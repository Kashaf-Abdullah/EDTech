const User          = require('../models/User');
const generateToken = require('../utils/generateToken');
const generateReferralCode = require('../utils/generateReferralCode');
const { sendWelcome } = require('../utils/sendEmail');
const { notify } = require('./notificationController');

const sendToken = (user, status, res) => {
  const token = generateToken(user._id);
  res.status(status).json({ success: true, token, user: {
    _id: user._id, name: user.name, email: user.email, role: user.role,
    profilePic: user.profilePic, approvalStatus: user.approvalStatus, isVerified: user.isVerified,
    referralCode: user.referralCode,
  }});
};

// Generates a unique referral code, retrying on the rare collision
const uniqueReferralCode = async (name) => {
  let code, exists = true;
  while (exists) {
    code = generateReferralCode(name);
    exists = await User.findOne({ referralCode: code });
  }
  return code;
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, refCode } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const referralCode = await uniqueReferralCode(name);

    let referredBy = null;
    if (refCode) {
      const referrer = await User.findOne({ referralCode: refCode });
      if (referrer) referredBy = referrer._id;
    }

    const user = await User.create({
      name, email, password,
      role: ['student','tutor'].includes(role) ? role : 'student',
      referralCode, referredBy,
    });

    try { await sendWelcome(user); } catch(_) {}

    if (referredBy) {
      await notify(referredBy, 'Your friend joined! 🎉', `${name} signed up using your invite link.`, 'system');
    }

    sendToken(user, 201, res);
  } catch(err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!(await user.matchPassword(password))) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (user.isBanned) return res.status(403).json({ success: false, message: 'Account banned' });
    sendToken(user, 200, res);
  } catch(err) { next(err); }
};

exports.getMe = async (req, res) => res.json({ success: true, user: req.user });

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = {};
    ['name','bio','subjects','experience','zoomLink'].forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    if (req.file) updates.profilePic = req.file.path;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ success: true, user });
  } catch(err) { next(err); }
};

exports.googleCallback = async (req, res) => {
  // Ensure Google sign-ups also get a referral code (in case they never went through /register)
  if (!req.user.referralCode) {
    req.user.referralCode = await uniqueReferralCode(req.user.name);
    await req.user.save();
  }
  const token = generateToken(req.user._id);
  res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
};
