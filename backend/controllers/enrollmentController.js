const Enrollment = require('../models/Enrollment');
const Course     = require('../models/Course');
const Progress   = require('../models/Progress');

exports.getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({ path:'course', populate: { path:'tutor', select:'name profilePic' } })
      .sort('-enrolledAt');
    res.json({ success:true, enrollments });
  } catch(err) { next(err); }
};

exports.checkEnrollment = async (req, res, next) => {
  try {
    const e = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
    res.json({ success:true, isEnrolled: !!e });
  } catch(err) { next(err); }
};
