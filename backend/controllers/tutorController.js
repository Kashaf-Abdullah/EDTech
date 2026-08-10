const User       = require('../models/User');
const Course     = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Session    = require('../models/Session');

// Fields a STUDENT is allowed to see about a tutor.
// Notably excludes: phone, address, company — those stay admin/tutor-only.
const PUBLIC_TUTOR_FIELDS = 'name bio subjects profilePic experience education createdAt zoomLink referralCode';

exports.getAllTutors = async (req, res, next) => {
  try {
    const { subject, page=1, limit=12 } = req.query;
    const q = { role:'tutor', approvalStatus:'approved', isBanned:false };
    if (subject) q.subjects = { $in: [new RegExp(subject,'i')] };
    const total  = await User.countDocuments(q);
    const tutors = await User.find(q).select(PUBLIC_TUTOR_FIELDS).skip((page-1)*limit).limit(+limit);
    res.json({ success:true, tutors, total });
  } catch(err) { next(err); }
};

// Public profile — what a STUDENT (or anyone with the share link) sees.
// phone/company/address are intentionally NOT selected here.
exports.getTutorProfile = async (req, res, next) => {
  try {
    const tutor = await User.findOne({ _id:req.params.id, role:'tutor', approvalStatus:'approved' })
      .select(PUBLIC_TUTOR_FIELDS);
    if (!tutor) return res.status(404).json({ success:false, message:'Tutor not found' });
    const courses = await Course.find({ tutor:req.params.id, isApproved:true, isPublished:true })
      .select('title thumbnail price rating totalStudents category');
    res.json({ success:true, tutor, courses });
  } catch(err) { next(err); }
};

// Private profile — what the TUTOR sees about themselves (full info, including private fields)
exports.getMyTutorProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success:true, user });
  } catch(err) { next(err); }
};

exports.updateTutorProfile = async (req, res, next) => {
  try {
    const updates = {};
    ['name','bio','experience','zoomLink','company','address','phone'].forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    if (req.body.subjects) {
      updates.subjects = Array.isArray(req.body.subjects) ? req.body.subjects : req.body.subjects.split(',').map(s=>s.trim());
    }
    if (req.body.education) {
      // education sent as JSON string from the frontend form
      try { updates.education = JSON.parse(req.body.education); } catch(_) {}
    }
    if (req.file) updates.profilePic = req.file.path;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new:true });
    res.json({ success:true, user });
  } catch(err) { next(err); }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const courses   = await Course.find({ tutor:req.user._id });
    const courseIds = courses.map(c => c._id);
    const students  = await Enrollment.countDocuments({ course:{ $in:courseIds } });
    const sessions  = await Session.countDocuments({ tutor:req.user._id, status:'completed' });
    const tutor     = await User.findById(req.user._id).select('totalEarnings pendingPayout');
    res.json({ success:true, stats:{
      totalCourses:     courses.length,
      publishedCourses: courses.filter(c=>c.isPublished).length,
      totalStudents:    students,
      totalSessions:    sessions,
      totalEarnings:    tutor.totalEarnings,
      pendingPayout:    tutor.pendingPayout,
    }});
  } catch(err) { next(err); }
};
