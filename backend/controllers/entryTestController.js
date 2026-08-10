const EntryTest = require('../models/EntryTest');
const EntryTestAttempt = require('../models/EntryTestAttempt');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { notify } = require('./notificationController');

const COMMISSION = +(process.env.PLATFORM_COMMISSION || 15) / 100;

exports.getEntryTests = async (req, res, next) => {
  try {
    const tests = await EntryTest.find({ isPublished: true }).sort('-createdAt').lean();
    const studentId = req.user?._id;
    if (!studentId) {
      return res.json({ success: true, tests });
    }

    const payments = await Payment.find({ student: studentId, status: 'approved' }).lean();
    const unlockedTestIds = new Set(payments.map(p => p.entryTest?.toString()).filter(Boolean));

    const enriched = tests.map(test => {
      const isUnlocked = test.price <= 0 || unlockedTestIds.has(test._id.toString());
      const safeQuestions = isUnlocked ? test.questions : test.questions.slice(0, test.freeQuestionCount || 20);
      return {
        ...test,
        isUnlocked,
        questions: safeQuestions.map(q => ({
          ...q,
          correctAnswer: isUnlocked ? q.correctAnswer : ''
        }))
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

    const existing = await Payment.findOne({ student: req.user._id, entryTest: test._id, status: { $in: ['pending','approved'] } });
    if (existing) return res.json({ success: true, payment: existing, message: existing.status === 'approved' ? 'Already unlocked' : 'Payment already submitted' });

    const fee = Math.round(test.price * COMMISSION);
    const payment = await Payment.create({
      student: req.user._id,
      entryTest: test._id,
      tutor: req.user._id,
      amount: test.price,
      platformFee: fee,
      tutorEarning: test.price - fee,
      method: 'manual',
      status: 'pending',
      adminNote: 'Entry test unlock',
    });

    await notify(req.user._id, 'Entry Test Unlock Request Submitted 🧾', `Your payment request for "${test.title}" is under review.`, 'payment', '/entry-tests');
    await notify((await User.findOne({ role: 'admin' }))._id, 'New Entry Test Unlock Request 🔔', `Student requested access to "${test.title}". Please review the payment.`, 'payment', '/admin/entry-tests');

    res.status(201).json({ success: true, payment, message: 'Unlock request submitted' });
  } catch (err) { next(err); }
};

exports.startAttempt = async (req, res, next) => {
  try {
    const test = await EntryTest.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    if (test.price > 0) {
      const unlockPayment = await Payment.findOne({ student: req.user._id, entryTest: test._id, status: 'approved' });
      if (!unlockPayment) {
        return res.status(403).json({ success: false, message: 'This test is locked. Please unlock it first.' });
      }
    }

    const existing = await EntryTestAttempt.findOne({ student: req.user._id, test: test._id, status: 'in_progress' });
    if (existing) return res.json({ success: true, attempt: existing, test });

    const attempt = await EntryTestAttempt.create({
      student: req.user._id,
      test: test._id,
      totalQuestions: test.questions.length,
      status: 'in_progress',
      answers: new Array(test.questions.length).fill('')
    });

    res.status(201).json({ success: true, attempt, test });
  } catch (err) { next(err); }
};

exports.submitAttempt = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const attempt = await EntryTestAttempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });

    const test = await EntryTest.findById(attempt.test);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    const safeAnswers = answers || [];
    let score = 0;
    test.questions.forEach((q, index) => {
      if (safeAnswers[index] === q.correctAnswer) score += 1;
    });

    const percentage = Math.round((score / Math.max(test.questions.length, 1)) * 100);
    attempt.answers = safeAnswers;
    attempt.score = score;
    attempt.totalQuestions = test.questions.length;
    attempt.percentage = percentage;
    attempt.status = 'completed';
    attempt.completedAt = new Date();
    await attempt.save();

    test.totalAttempts += 1;
    test.averageScore = Math.round(((test.averageScore * (test.totalAttempts - 1)) + percentage) / test.totalAttempts);
    await test.save();

    res.json({ success: true, attempt, test });
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
