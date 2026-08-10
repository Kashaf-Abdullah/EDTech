const stripe     = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment    = require('../models/Payment');
const Course     = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User       = require('../models/User');
const { sendEnrollment, sendPaymentApproved, sendPaymentRejected } = require('../utils/sendEmail');
const { notify } = require('./notificationController');

const COMMISSION = +(process.env.PLATFORM_COMMISSION || 15) / 100;

const doEnroll = async (paymentId) => {
  const payment = await Payment.findById(paymentId).populate('course student');
  if (!payment || payment.status !== 'approved') return;
  const exists = await Enrollment.findOne({ student: payment.student._id, course: payment.course._id });
  if (!exists) {
    await Enrollment.create({ student: payment.student._id, course: payment.course._id, payment: payment._id });
    await Course.findByIdAndUpdate(payment.course._id, { $inc: { totalStudents: 1 } });
    await User.findByIdAndUpdate(payment.tutor, { $inc: { totalEarnings: payment.tutorEarning, pendingPayout: payment.tutorEarning } });
    try { await sendEnrollment(payment.student, payment.course); } catch(_) {}
    await notify(payment.student._id, 'Enrolled successfully! 🎉', `You are now enrolled in "${payment.course.title}". Start learning now!`, 'enrollment', `/learn/${payment.course._id}`);
    await notify(payment.tutor, 'New student enrolled! 💰', `A student just enrolled in "${payment.course.title}". You earned PKR ${payment.tutorEarning}.`, 'enrollment', '/tutor/dashboard');
  }
};

// Stripe
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course) return res.status(404).json({ success:false, message:'Course not found' });
    const intent = await stripe.paymentIntents.create({
      amount: course.price * 100,
      currency: 'pkr',
      metadata: { courseId: course._id.toString(), studentId: req.user._id.toString() },
    });
    res.json({ success:true, clientSecret: intent.client_secret });
  } catch(err) { next(err); }
};

exports.confirmStripePayment = async (req, res, next) => {
  try {
    const { paymentIntentId, courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success:false, message:'Course not found' });
    const fee = Math.round(course.price * COMMISSION);
    const payment = await Payment.create({
      student: req.user._id, course: courseId, tutor: course.tutor,
      amount: course.price, platformFee: fee, tutorEarning: course.price - fee,
      method: 'stripe', status: 'approved', stripePaymentIntentId: paymentIntentId,
    });
    await doEnroll(payment._id);
    res.json({ success:true, message:'Payment confirmed', payment });
  } catch(err) { next(err); }
};

// Manual payment
exports.submitManualPayment = async (req, res, next) => {
  try {
    const { courseId, bankName, transactionId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success:false, message:'Course not found' });
    const fee = Math.round(course.price * COMMISSION);
    const payment = await Payment.create({
      student: req.user._id, course: courseId, tutor: course.tutor,
      amount: course.price, platformFee: fee, tutorEarning: course.price - fee,
      method: 'manual', status: 'pending', bankName, transactionId,
      screenshotUrl: req.file ? req.file.path : '',
    });
    await notify(req.user._id, 'Payment submitted ⏳', `Your payment for "${course.title}" is under review. You'll be notified once approved.`, 'payment', '/dashboard');
    res.status(201).json({ success:true, payment });
  } catch(err) { next(err); }
};

exports.getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ student: req.user._id }).populate('course','title thumbnail').sort('-createdAt');
    res.json({ success:true, payments });
  } catch(err) { next(err); }
};

// Admin
exports.getPendingPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ method:'manual', status:'pending' })
      .populate('student','name email').populate('course','title price').sort('-createdAt');
    res.json({ success:true, payments });
  } catch(err) { next(err); }
};

exports.reviewPayment = async (req, res, next) => {
  try {
    const { action, note } = req.body;
    const payment = await Payment.findById(req.params.id).populate('student course');
    if (!payment) return res.status(404).json({ success:false, message:'Not found' });
    payment.status     = action === 'approve' ? 'approved' : 'rejected';
    payment.adminNote   = note || '';
    payment.reviewedAt  = new Date();
    payment.reviewedBy  = req.user._id;
    await payment.save();
    if (action === 'approve') {
      await doEnroll(payment._id);
      try { await sendPaymentApproved(payment.student, payment.course); } catch(_) {}
      await notify(payment.student._id, 'Payment Approved! ✅', `Your payment for "${payment.course.title}" has been approved. Happy learning!`, 'payment', `/learn/${payment.course._id}`);
    } else {
      try { await sendPaymentRejected(payment.student, payment.course, note); } catch(_) {}
      await notify(payment.student._id, 'Payment Rejected ❌', `Your payment for "${payment.course.title}" was not approved. Reason: ${note || 'Not specified'}`, 'payment', `/checkout/${payment.course._id}`);
    }
    res.json({ success:true, payment });
  } catch(err) { next(err); }
};

exports.getTutorEarnings = async (req, res, next) => {
  try {
    const payments = await Payment.find({ tutor: req.user._id, status:'approved' })
      .populate('course','title').populate('student','name').sort('-createdAt');
    const total   = payments.reduce((s,p) => s + p.tutorEarning, 0);
    const pending = await User.findById(req.user._id).then(u => u.pendingPayout);
    res.json({ success:true, payments, totalEarned: total, pendingPayout: pending });
  } catch(err) { next(err); }
};
