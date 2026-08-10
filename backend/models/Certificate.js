const mongoose = require('mongoose');
const certSchema = new mongoose.Schema({
  student:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course:        { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  issuedAt:      { type: Date, default: Date.now },
  certificateId: { type: String, unique: true },
  pdfUrl:        String,
  // Snapshot fields — frozen at issue time so the certificate never changes
  // even if the student/tutor/admin later edits their name or signature.
  studentName:     String,
  tutorName:        String,
  courseTitle:      String,
  adminSignature:   String,
  adminName:        String,
  adminDesignation: String,
  platformName:     String,
}, { timestamps: true });
module.exports = mongoose.model('Certificate', certSchema);
