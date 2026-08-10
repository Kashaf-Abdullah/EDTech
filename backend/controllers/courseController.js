const Course     = require('../models/Course');
const Enrollment = require('../models/Enrollment');

exports.getCourses = async (req, res, next) => {
  try {
    const { search, category, level, minPrice, maxPrice, featured, page=1, limit=12, sort='-createdAt' } = req.query;
    const q = { isApproved: true, isPublished: true };
    if (search)   q.$or = [{ title: new RegExp(search,'i') }, { description: new RegExp(search,'i') }, { tags: new RegExp(search,'i') }];
    if (category) q.category = category;
    if (level)    q.level = level;
    if (featured) q.isFeatured = true;
    if (minPrice || maxPrice) { q.price = {}; if (minPrice) q.price.$gte = +minPrice; if (maxPrice) q.price.$lte = +maxPrice; }
    const total   = await Course.countDocuments(q);
    const courses = await Course.find(q).populate('tutor','name profilePic').select('-sections -lessons').sort(sort).skip((page-1)*limit).limit(+limit);
    res.json({ success:true, courses, total, page:+page, pages: Math.ceil(total/limit) });
  } catch(err) { next(err); }
};

exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('tutor','name profilePic bio subjects experience');
    if (!course) return res.status(404).json({ success:false, message:'Course not found' });
    res.json({ success:true, course });
  } catch(err) { next(err); }
};

exports.getMyCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ tutor: req.user._id }).sort('-createdAt');
    res.json({ success:true, courses });
  } catch(err) { next(err); }
};

exports.createCourse = async (req, res, next) => {
  try {
    if (req.user.approvalStatus !== 'approved')
      return res.status(403).json({ success:false, message:'Tutor not approved yet' });
    const { title, description, price, category, level, language, tags, whatYouLearn, requirements } = req.body;
    const course = await Course.create({
      title, description, price, category, level, language,
      tutor: req.user._id,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t=>t.trim())) : [],
      whatYouLearn: whatYouLearn ? (Array.isArray(whatYouLearn) ? whatYouLearn : whatYouLearn.split('\n')) : [],
      requirements: requirements ? (Array.isArray(requirements) ? requirements : requirements.split('\n')) : [],
      thumbnail: req.file ? req.file.path : '',
    });
    res.status(201).json({ success:true, course });
  } catch(err) { next(err); }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success:false, message:'Not found' });
    if (course.tutor.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success:false, message:'Forbidden' });
    const updates = { ...req.body };
    if (req.file) updates.thumbnail = req.file.path;
    if (updates.tags && typeof updates.tags === 'string') updates.tags = updates.tags.split(',').map(t=>t.trim());
    const updated = await Course.findByIdAndUpdate(req.params.id, updates, { new:true });
    res.json({ success:true, course: updated });
  } catch(err) { next(err); }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success:false, message:'Not found' });
    if (course.tutor.toString() !== req.user._id.toString())
      return res.status(403).json({ success:false, message:'Forbidden' });
    await course.deleteOne();
    res.json({ success:true, message:'Course deleted' });
  } catch(err) { next(err); }
};

exports.togglePublish = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || course.tutor.toString() !== req.user._id.toString())
      return res.status(403).json({ success:false, message:'Forbidden' });
    course.isPublished = !course.isPublished;
    await course.save();
    res.json({ success:true, isPublished: course.isPublished });
  } catch(err) { next(err); }
};

// Section management
exports.addSection = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || course.tutor.toString() !== req.user._id.toString())
      return res.status(403).json({ success:false, message:'Forbidden' });
    course.sections.push({ title: req.body.title, order: course.sections.length });
    await course.save();
    res.json({ success:true, sections: course.sections });
  } catch(err) { next(err); }
};

exports.addLesson = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || course.tutor.toString() !== req.user._id.toString())
      return res.status(403).json({ success:false, message:'Forbidden' });
    const { title, type, isFree, duration, sectionId } = req.body;
    const lesson = {
      title, type: type || (req.file?.mimetype === 'application/pdf' ? 'pdf' : 'video'),
      url: req.file ? req.file.path : req.body.url || '',
      publicId: req.file?.filename || '',
      duration: +duration || 0,
      isFree: isFree === 'true' || isFree === true,
      order: 0,
    };
    if (sectionId) {
      const sec = course.sections.id(sectionId);
      if (sec) { lesson.order = sec.lessons.length; sec.lessons.push(lesson); }
    } else {
      lesson.order = course.lessons.length;
      course.lessons.push(lesson);
    }
    await course.save();
    res.status(201).json({ success:true, course });
  } catch(err) { next(err); }
};

exports.deleteLesson = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || course.tutor.toString() !== req.user._id.toString())
      return res.status(403).json({ success:false, message:'Forbidden' });
    course.lessons = course.lessons.filter(l => l._id.toString() !== req.params.lessonId);
    course.sections.forEach(s => { s.lessons = s.lessons.filter(l => l._id.toString() !== req.params.lessonId); });
    await course.save();
    res.json({ success:true });
  } catch(err) { next(err); }
};

exports.getEnrolledStudents = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ course: req.params.id }).populate('student','name email profilePic');
    res.json({ success:true, students: enrollments.map(e => e.student), total: enrollments.length });
  } catch(err) { next(err); }
};
