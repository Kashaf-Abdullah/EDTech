const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const educationSchema = new mongoose.Schema({
  degree:       String,
  institution:  String,
  year:         String,
}, { _id: false });

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, select: false },
  googleId:   String,
  role:       { type: String, enum: ['student','tutor','admin'], default: 'student' },
  profilePic: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },
  isBanned:   { type: Boolean, default: false },

  // Tutor public-facing fields (visible to students)
  bio:            { type: String, default: '' },
  subjects:       [String],
  experience:     { type: String, default: '' },
  education:      [educationSchema],   // public — shows credibility
  qualificationDoc: String,
  cnicDoc:        String,
  approvalStatus: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  rejectionReason:{ type: String, default: '' },

  // Tutor PRIVATE fields — admin-only, never sent to students.
  // Kept on the same User document for simplicity but stripped out
  // in every student-facing controller response (see tutorController.js).
  company: { type: String, default: '' },
  address: { type: String, default: '' },
  phone:   { type: String, default: '' },

  // Stripe / earnings
  stripeAccountId: String,
  totalEarnings:  { type: Number, default: 0 },
  pendingPayout:  { type: Number, default: 0 },

  // Zoom
  zoomLink: { type: String, default: '' },

  // Referral system
  referralCode: { type: String, unique: true, sparse: true }, // this user's own shareable code
  referredBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // who invited them
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function(p) { return bcrypt.compare(p, this.password); };

module.exports = mongoose.model('User', userSchema);
