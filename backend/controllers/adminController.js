const User       = require('../models/User');
const Course     = require('../models/Course');
const Payment    = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const { sendTutorApproved, sendTutorRejected } = require('../utils/sendEmail');
const { notify } = require('./notificationController');

exports.getStats = async (req, res, next) => {
  try {
    const [students, tutors, pendingTutors, courses, pendingCourses, payments] = await Promise.all([
      User.countDocuments({ role:'student' }),
      User.countDocuments({ role:'tutor', approvalStatus:'approved' }),
      User.countDocuments({ role:'tutor', approvalStatus:'pending' }),
      Course.countDocuments({ isApproved:true }),
      Course.countDocuments({ isApproved:false }),
      Payment.find({ status:'approved' }),
    ]);
    const totalRevenue = payments.reduce((s,p) => s + p.platformFee, 0);
    const monthRevenue = payments.filter(p => new Date(p.createdAt) > new Date(Date.now() - 30*24*60*60*1000))
                                  .reduce((s,p) => s + p.platformFee, 0);
    res.json({ success:true, stats:{ students, tutors, pendingTutors, courses, pendingCourses, totalRevenue, monthRevenue }});
  } catch(err) { next(err); }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { role, page=1, limit=20 } = req.query;
    const q = {};
    if (role) q.role = role;
    const total = await User.countDocuments(q);
    const users = await User.find(q).select('-password').populate('referredBy','name email').sort('-createdAt').skip((page-1)*limit).limit(+limit);
    res.json({ success:true, users, total });
  } catch(err) { next(err); }
};

exports.banUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true }, { new:true });
    await notify(user._id, 'Account Suspended', 'Your account has been banned by admin. Contact support for details.', 'system');
    res.json({ success:true, user });
  } catch(err) { next(err); }
};

exports.unbanUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false }, { new:true });
    await notify(user._id, 'Account Restored', 'Your account has been unbanned. Welcome back!', 'system');
    res.json({ success:true, user });
  } catch(err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success:true, message:'User deleted' });
  } catch(err) { next(err); }
};

exports.getPendingTutors = async (req, res, next) => {
  try {
    const { status='pending' } = req.query;
    const tutors = await User.find({ role:'tutor', approvalStatus: status }).select('-password').sort('-createdAt');
    res.json({ success:true, tutors, total: tutors.length });
  } catch(err) { next(err); }
};

exports.approveTutor = async (req, res, next) => {
  try {
    const tutor = await User.findByIdAndUpdate(req.params.id, { approvalStatus:'approved', rejectionReason:'' }, { new:true });
    if (!tutor) return res.status(404).json({ success:false, message:'Not found' });
    try { await sendTutorApproved(tutor); } catch(_) {}
    await notify(tutor._id, 'Tutor Account Approved! 🎉', 'Congratulations! Your tutor account is approved. Start creating courses now.', 'tutor', '/tutor/dashboard');
    res.json({ success:true, tutor });
  } catch(err) { next(err); }
};

exports.rejectTutor = async (req, res, next) => {
  try {
    const { reason='Does not meet requirements' } = req.body;
    const tutor = await User.findByIdAndUpdate(req.params.id, { approvalStatus:'rejected', rejectionReason:reason }, { new:true });
    if (!tutor) return res.status(404).json({ success:false, message:'Not found' });
    try { await sendTutorRejected(tutor, reason); } catch(_) {}
    await notify(tutor._id, 'Tutor Application Update', `Your application was not approved. Reason: ${reason}`, 'tutor', '/tutor/profile');
    res.json({ success:true, tutor });
  } catch(err) { next(err); }
};

exports.getAdminCourses = async (req, res, next) => {
  try {
    const { approved, page=1, limit=20 } = req.query;
    const q = {};
    if (approved === 'false') q.isApproved = false;
    if (approved === 'true')  q.isApproved = true;
    const total   = await Course.countDocuments(q);
    const courses = await Course.find(q).populate('tutor','name email').sort('-createdAt').skip((page-1)*limit).limit(+limit);
    res.json({ success:true, courses, total });
  } catch(err) { next(err); }
};

exports.approveCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { isApproved:true }, { new:true });
    if (!course) return res.status(404).json({ success:false, message:'Not found' });
    await notify(course.tutor, 'Course Approved! ✅', `Your course "${course.title}" has been approved and is now live.`, 'course', `/tutor/courses/${course._id}`);
    res.json({ success:true, course });
  } catch(err) { next(err); }
};

exports.rejectCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { isApproved:false, isPublished:false }, { new:true });
    await notify(course.tutor, 'Course Needs Review', `Your course "${course.title}" was not approved. Please review and resubmit.`, 'course', `/tutor/courses/${course._id}`);
    res.json({ success:true, course });
  } catch(err) { next(err); }
};

exports.featureCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success:false, message:'Not found' });
    course.isFeatured = !course.isFeatured;
    await course.save();
    if (course.isFeatured) {
      await notify(course.tutor, 'Course Featured! ⭐', `Your course "${course.title}" is now featured on the homepage!`, 'course', `/tutor/courses/${course._id}`);
    }
    res.json({ success:true, isFeatured: course.isFeatured });
  } catch(err) { next(err); }
};

exports.getRevenueData = async (req, res, next) => {
  try {
    const payments = await Payment.find({ status:'approved' }).sort('-createdAt').populate('course','title').populate('student','name');
    res.json({ success:true, payments });
  } catch(err) { next(err); }
};
