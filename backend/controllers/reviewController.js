const Review     = require('../models/Review');
const Course     = require('../models/Course');
const Enrollment = require('../models/Enrollment');

exports.addReview = async (req, res, next) => {
  try {
    const { courseId, rating, comment } = req.body;
    const enrolled = await Enrollment.findOne({ student: req.user._id, course: courseId });
    if (!enrolled) return res.status(403).json({ success:false, message:'Must be enrolled to review' });
    const existing = await Review.findOne({ student: req.user._id, course: courseId });
    if (existing) return res.status(400).json({ success:false, message:'Already reviewed' });
    const review = await Review.create({ student: req.user._id, course: courseId, rating, comment });
    // Update course rating
    const reviews  = await Review.find({ course: courseId });
    const avgRating = reviews.reduce((s,r) => s + r.rating, 0) / reviews.length;
    await Course.findByIdAndUpdate(courseId, { rating: +avgRating.toFixed(1), totalReviews: reviews.length });
    await review.populate('student','name profilePic');
    res.status(201).json({ success:true, review });
  } catch(err) { next(err); }
};

exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, student: req.user._id });
    if (!review) return res.status(404).json({ success:false, message:'Not found' });
    if (req.body.rating)  review.rating  = req.body.rating;
    if (req.body.comment) review.comment = req.body.comment;
    await review.save();
    const reviews  = await Review.find({ course: review.course });
    const avgRating = reviews.reduce((s,r) => s + r.rating, 0) / reviews.length;
    await Course.findByIdAndUpdate(review.course, { rating: +avgRating.toFixed(1) });
    res.json({ success:true, review });
  } catch(err) { next(err); }
};

exports.getCourseReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('student','name profilePic').sort('-createdAt');
    res.json({ success:true, reviews });
  } catch(err) { next(err); }
};
