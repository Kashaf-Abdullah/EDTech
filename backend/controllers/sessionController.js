const Session = require('../models/Session');
const { sendSessionConfirmed } = require('../utils/sendEmail');
const { notify } = require('./notificationController');

exports.bookSession = async (req, res, next) => {
  try {
    const { tutorId, date, duration, subject, price } = req.body;
    const session = await Session.create({ tutor: tutorId, student: req.user._id, date, duration, subject, price });
    await session.populate('tutor','name email zoomLink');
    await notify(tutorId, 'New Session Request 📅', `${req.user.name} requested a session on ${new Date(date).toLocaleString()}.`, 'session', '/tutor/sessions');
    res.status(201).json({ success:true, session });
  } catch(err) { next(err); }
};

exports.getMySessionsAsStudent = async (req, res, next) => {
  try {
    const sessions = await Session.find({ student: req.user._id }).populate('tutor','name profilePic zoomLink').sort('-date');
    res.json({ success:true, sessions });
  } catch(err) { next(err); }
};

exports.getMySessionsAsTutor = async (req, res, next) => {
  try {
    const sessions = await Session.find({ tutor: req.user._id }).populate('student','name email profilePic').sort('-date');
    res.json({ success:true, sessions });
  } catch(err) { next(err); }
};

exports.updateSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id).populate('student','name email').populate('tutor','name');
    if (!session) return res.status(404).json({ success:false, message:'Not found' });
    if (session.tutor._id.toString() !== req.user._id.toString() && session.student._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success:false, message:'Forbidden' });
    const allowed = ['status','zoomLink','date','cancelReason','notes'];
    allowed.forEach(f => { if (req.body[f] !== undefined) session[f] = req.body[f]; });
    await session.save();
    if (req.body.status === 'confirmed') {
      try { await sendSessionConfirmed(session.student, session); } catch(_) {}
      await notify(session.student._id, 'Session Confirmed! ✅', `Your session with ${session.tutor.name} is confirmed for ${new Date(session.date).toLocaleString()}.`, 'session', '/sessions');
    }
    if (req.body.status === 'cancelled') {
      const recipientId = req.user._id.toString() === session.tutor._id.toString() ? session.student._id : session.tutor._id;
      await notify(recipientId, 'Session Cancelled', `A session scheduled for ${new Date(session.date).toLocaleString()} was cancelled.`, 'session');
    }
    if (req.body.status === 'completed') {
      await notify(session.student._id, 'Session Completed', `Your session with ${session.tutor.name} has been marked complete.`, 'session', '/sessions');
    }
    res.json({ success:true, session });
  } catch(err) { next(err); }
};
