const EntryTest = require('../models/EntryTest');
const EntryTestAttempt = require('../models/EntryTestAttempt');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { notify } = require('./notificationController');

const getFreeQuestions = (test) => {
  const questions = test.questions || [];
  const markedFree = questions.filter(q => q.isFree);
  if (markedFree.length > 0) return markedFree;
  const limit = Math.min(test.freeQuestionCount || 0, questions.length);
  return questions.slice(0, limit);
};

const stripAnswers = (questions) =>
  (questions || []).map(q => ({
    ...(typeof q.toObject === 'function' ? q.toObject() : q),
    correctAnswer: '',
    explanation: '',
  }));

exports.getEntryTests = async (req, res, next) => {
  try {
    const tests = await EntryTest.find({ isPublished: true }).sort('-createdAt').lean();
    const studentId = req.user?._id;
    if (!studentId) {
      return res.json({ success: true, tests });
    }
    const payments = await Payment.find({
      student: studentId,
      entryTest: { $exists: true },
      status: { $in: ['pending', 'approved'] },
    }).lean();

    const unlockedTestIds = new Set(
      payments.filter(p => p.status === 'approved').map(p => p.entryTest?.toString()).filter(Boolean)
    );
    const pendingTestIds = new Set(
      payments.filter(p => p.status === 'pending').map(p => p.entryTest?.toString()).filter(Boolean)
    );

    const enriched = tests.map(test => {
      const idStr = test._id.toString();
      const isUnlocked = test.price <= 0 || unlockedTestIds.has(idStr);
      const isPendingUnlock = !isUnlocked && pendingTestIds.has(idStr);
      const freeQuestions = getFreeQuestions(test);
      const safeQuestions = isUnlocked ? test.questions : freeQuestions;
      return {
        ...test,
        isUnlocked,
        isPendingUnlock,
        totalQuestions: test.questions.length,
        freeCount: freeQuestions.length,
        questions: stripAnswers(safeQuestions),
      };
    });
    res.json({ success: true, tests: enriched });
  } catch (err) { next(err); }
};

exports.createEntryTest = async (req, res, next) => {
  try {
    const { title, examType, subject, description, freeQuestionCount, price, questions } = req.body;
    const test = await EntryTest.create({
      title,
      examType,
      subject,
      description,
      freeQuestionCount: freeQuestionCount || 20,
      price: Number(price || 0),
      createdBy: req.user._id,
      questions: (questions || []).map(q => ({
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        isFree: Boolean(q.isFree),
      })),
    });
    res.status(201).json({ success: true, test });
  } catch (err) { next(err); }
};

exports.getAdminEntryTests = async (req, res, next) => {
  try {
    const tests = await EntryTest.find().sort('-createdAt').populate('createdBy', 'name email');
    res.json({ success: true, tests });
  } catch (err) { next(err); }
};

exports.getEntryTestById = async (req, res, next) => {
  try {
    const test = await EntryTest.findById(req.params.id).populate('createdBy', 'name email');
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    res.json({ success: true, test });
  } catch (err) { next(err); }
};

exports.updateEntryTest = async (req, res, next) => {
  try {
    const { title, examType, subject, description, freeQuestionCount, price, questions, isPublished } = req.body;
    const test = await EntryTest.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    test.title = title ?? test.title;
    test.examType = examType ?? test.examType;
    test.subject = subject ?? test.subject;
    test.description = description ?? test.description;
    test.freeQuestionCount = Number(freeQuestionCount ?? test.freeQuestionCount);
    test.price = Number(price ?? test.price);
    test.isPublished = typeof isPublished === 'boolean' ? isPublished : test.isPublished;
    test.questions = (questions || []).map(q => ({
      text: q.text || '',
      options: (q.options || []).map(opt => opt || ''),
      correctAnswer: q.correctAnswer || '',
      explanation: q.explanation || '',
      isFree: Boolean(q.isFree),
    }));
    await test.save();
    res.json({ success: true, test });
  } catch (err) { next(err); }
};

exports.deleteEntryTest = async (req, res, next) => {
  try {
    const test = await EntryTest.findByIdAndDelete(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    res.json({ success: true, message: 'Test deleted' });
  } catch (err) { next(err); }
};

exports.toggleEntryTestPublish = async (req, res, next) => {
  try {
    const test = await EntryTest.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    test.isPublished = !test.isPublished;
    await test.save();
    res.json({ success: true, test });
  } catch (err) { next(err); }
};

exports.unlockEntryTest = async (req, res, next) => {
  try {
    const test = await EntryTest.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    if (test.price <= 0) return res.json({ success: true, message: 'Free test already unlocked' });

    const existing = await Payment.findOne({
      student: req.user._id,
      entryTest: test._id,
      status: { $in: ['pending', 'approved'] },
    });
    if (existing) {
      return res.json({
        success: true,
        payment: existing,
        message: existing.status === 'approved' ? 'Already unlocked' : 'Unlock request already submitted and pending review',
      });
    }

    const { bankName, transactionId } = req.body || {};
    const payment = await Payment.create({
      student: req.user._id,
      entryTest: test._id,
      amount: test.price,
      platformFee: test.price,
      tutorEarning: 0,
      method: 'manual',
      status: 'pending',
      bankName: bankName || 'manual',
      transactionId: transactionId || '',
      screenshotUrl: req.file ? req.file.path : '',
      adminNote: 'Entry test unlock',
    });

    await notify(
      req.user._id,
      'Entry Test Unlock Request Submitted ⏳',
      `Your payment request for "${test.title}" is under review.`,
      'payment',
      '/entry-tests'
    );
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      await notify(
        admin._id,
        'New Entry Test Unlock Request 🔔',
        `${req.user.name} requested access to "${test.title}". Please review the payment.`,
        'payment',
        '/admin/entry-tests'
      );
    }
    res.status(201).json({ success: true, payment, message: 'Payment submitted for admin review!' });
  } catch (err) { next(err); }
};

exports.startAttempt = async (req, res, next) => {
  try {
    const test = await EntryTest.findById(req.params.id).lean();
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    let isUnlocked = test.price <= 0;
    if (!isUnlocked) {
      const unlockPayment = await Payment.findOne({
        student: req.user._id,
        entryTest: test._id,
        status: 'approved',
      });
      isUnlocked = Boolean(unlockPayment);
    }

    const activeQuestions = isUnlocked ? test.questions : getFreeQuestions(test);
    if (activeQuestions.length === 0) {
      return res.status(403).json({ success: false, message: 'This test is locked. Please unlock it first.' });
    }

    const isFreeOnly = !isUnlocked;
    const safeTest = {
      ...test,
      isUnlocked,
      totalQuestions: test.questions.length,
      freeCount: getFreeQuestions(test).length,
      questions: stripAnswers(activeQuestions),
    };

    const existing = await EntryTestAttempt.findOne({
      student: req.user._id,
      test: test._id,
      status: 'in_progress',
      isFreeOnly,
    });
    if (existing) {
      return res.json({ success: true, attempt: existing, test: safeTest });
    }

    const attempt = await EntryTestAttempt.create({
      student: req.user._id,
      test: test._id,
      totalQuestions: activeQuestions.length,
      isFreeOnly,
      status: 'in_progress',
      answers: new Array(activeQuestions.length).fill(''),
    });
    res.status(201).json({ success: true, attempt, test: safeTest });
  } catch (err) { next(err); }
};

exports.submitAttempt = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const attempt = await EntryTestAttempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });
    if (attempt.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const test = await EntryTest.findById(attempt.test);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    const activeQuestions = attempt.isFreeOnly ? getFreeQuestions(test) : test.questions;
    const safeAnswers = answers || [];
    let score = 0;
    activeQuestions.forEach((q, index) => {
      if (safeAnswers[index] === q.correctAnswer) score += 1;
    });
    const percentage = Math.round((score / Math.max(activeQuestions.length, 1)) * 100);

    attempt.answers = safeAnswers;
    attempt.score = score;
    attempt.totalQuestions = activeQuestions.length;
    attempt.percentage = percentage;
    attempt.status = 'completed';
    attempt.completedAt = new Date();
    await attempt.save();

    test.totalAttempts += 1;
    test.averageScore = Math.round(((test.averageScore * (test.totalAttempts - 1)) + percentage) / test.totalAttempts);
    await test.save();

    const responseTest = {
      ...test.toObject(),
      questions: activeQuestions,
    };
    res.json({ success: true, attempt, test: responseTest });
  } catch (err) { next(err); }
};

exports.getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await EntryTestAttempt.find({ student: req.user._id }).populate('test', 'title subject examType').sort('-createdAt');
    res.json({ success: true, attempts });
  } catch (err) { next(err); }
};

exports.getAdminUnlockRequests = async (req, res, next) => {
  try {
    const payments = await Payment.find({ entryTest: { $exists: true }, status: 'pending' })
      .populate('student', 'name email')
      .populate('entryTest', 'title subject examType price')
      .sort('-createdAt');
    res.json({ success: true, payments });
  } catch (err) { next(err); }
};

exports.reviewEntryTestUnlock = async (req, res, next) => {
  try {
    const { action, note } = req.body;
    const payment = await Payment.findById(req.params.id).populate('student entryTest');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    payment.status = action === 'approve' ? 'approved' : 'rejected';
    payment.adminNote = note || '';
    payment.reviewedAt = new Date();
    payment.reviewedBy = req.user._id;
    await payment.save();
    if (action === 'approve') {
      await notify(payment.student._id, 'Entry Test Unlocked ✅', `Your access for "${payment.entryTest.title}" is now active.`, 'payment', '/entry-tests');
      await notify(req.user._id, 'Entry Test Unlock Approved ✅', `You approved access for "${payment.entryTest.title}".`, 'payment', '/admin/entry-tests');
    } else {
      await notify(payment.student._id, 'Entry Test Unlock Rejected ❌', `Your request for "${payment.entryTest.title}" was not approved.`, 'payment', '/entry-tests');
    }
    res.json({ success: true, payment });
  } catch (err) { next(err); }
};
