const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const send = (to, subject, html) =>
  transporter.sendMail({ from: `"EduPak" <${process.env.EMAIL_USER}>`, to, subject, html });

exports.sendWelcome       = (u) => send(u.email, 'Welcome to EduPak!', `<h2>Hello ${u.name}!</h2><p>Your account is ready.</p>`);
exports.sendEnrollment    = (u, c) => send(u.email, `Enrolled: ${c.title}`, `<h2>Hi ${u.name}!</h2><p>You are enrolled in <b>${c.title}</b>. Start learning now!</p>`);
exports.sendPaymentApproved = (u, c) => send(u.email, 'Payment Approved!', `<h2>Hi ${u.name}!</h2><p>Your payment for <b>${c.title}</b> has been approved. Happy learning!</p>`);
exports.sendPaymentRejected = (u, c, reason) => send(u.email, 'Payment Update', `<h2>Hi ${u.name}!</h2><p>Your payment for <b>${c.title}</b> was not approved.</p><p>Reason: ${reason}</p>`);
exports.sendTutorApproved   = (u) => send(u.email, 'Tutor Account Approved!', `<h2>Congratulations ${u.name}!</h2><p>Your tutor account is approved. Start creating courses!</p>`);
exports.sendTutorRejected   = (u, reason) => send(u.email, 'Tutor Application Update', `<h2>Hi ${u.name}</h2><p>Your application was not approved.</p><p>Reason: ${reason}</p>`);
exports.sendCertificate     = (u, c) => send(u.email, `Certificate: ${c.title}`, `<h2>Congratulations ${u.name}!</h2><p>You have completed <b>${c.title}</b>. Download your certificate from the dashboard.</p>`);
exports.sendSessionConfirmed = (u, s) => send(u.email, 'Session Confirmed', `<h2>Hi ${u.name}!</h2><p>Your session is confirmed for ${new Date(s.date).toLocaleString()}.</p><p>Zoom Link: ${s.zoomLink || 'Will be shared soon'}</p>`);
