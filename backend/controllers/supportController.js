const User = require('../models/User');

// Returns the first available admin so students/tutors have someone to message for "Support"
exports.getSupportContact = async (req, res, next) => {
  try {
    const admin = await User.findOne({ role: 'admin' }).select('name profilePic');
    if (!admin) return res.status(404).json({ success:false, message:'No support agent available' });
    res.json({ success:true, admin });
  } catch(err) { next(err); }
};
