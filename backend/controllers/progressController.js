const Progress         = require('../models/Progress');
const Course           = require('../models/Course');
const Enrollment       = require('../models/Enrollment');
const Certificate       = require('../models/Certificate');
const PlatformSettings  = require('../models/PlatformSettings');
const User              = require('../models/User');
const { sendCertificate } = require('../utils/sendEmail');
const { notify } = require('./notificationController');

exports.getProgress = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({ student: req.user._id, course: req.params.courseId });
    res.json({ success:true, progress: progress || { completedLessons:[], percentage:0 } });
  } catch(err) { next(err); }
};

exports.markLesson = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.body;
    const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId });
    if (!enrollment) return res.status(403).json({ success:false, message:'Not enrolled' });

    const course = await Course.findById(courseId).populate('tutor', 'name');
    const allLessons = [...course.lessons, ...course.sections.flatMap(s => s.lessons)];
    const total = allLessons.length;

    let progress = await Progress.findOne({ student: req.user._id, course: courseId });
    if (!progress) progress = new Progress({ student: req.user._id, course: courseId });

    if (!progress.completedLessons.map(String).includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }
    progress.lastWatchedLesson = lessonId;
    progress.lastWatchedAt = new Date();
    progress.percentage = total > 0 ? Math.round((progress.completedLessons.length / total) * 100) : 0;

    if (progress.percentage >= 100 && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
      enrollment.isCompleted = true;
      enrollment.completedAt = new Date();
      await enrollment.save();

      // Snapshot all the info needed to render the certificate later —
      // this way the certificate never changes even if names/signature change afterward.
      let settings = await PlatformSettings.findOne();
      if (!settings) settings = await PlatformSettings.create({});

      const certId = 'EDUPAK-' + Date.now();
      await Certificate.create({
        student: req.user._id,
        course: courseId,
        certificateId: certId,
        studentName:      req.user.name,
        tutorName:         course.tutor?.name || 'Tutor',
        courseTitle:       course.title,
        adminSignature:    settings.adminSignature,
        adminName:         settings.adminName,
        adminDesignation:  settings.adminDesignation,
        platformName:      settings.platformName,
      });

      try { await sendCertificate(req.user, course); } catch(_) {}
      await notify(req.user._id, 'Course Completed! 🏆', `Congratulations! You completed "${course.title}". Your certificate is ready.`, 'course', '/certificates');
    }
    await progress.save();
    res.json({ success:true, progress });
  } catch(err) { next(err); }
};

exports.getAllProgress = async (req, res, next) => {
  try {
    const progresses = await Progress.find({ student: req.user._id }).populate('course','title thumbnail');
    res.json({ success:true, progresses });
  } catch(err) { next(err); }
};
