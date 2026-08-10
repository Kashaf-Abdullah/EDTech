const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  type:     { type: String, enum: ['video','pdf','quiz'], required: true },
  url:      String,
  publicId: String,
  duration: { type: Number, default: 0 },
  order:    { type: Number, default: 0 },
  isFree:   { type: Boolean, default: false },
  quizQuestions: [{
    question: String,
    options:  [String],
    correct:  Number,
  }],
});

const sectionSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  order:   { type: Number, default: 0 },
  lessons: [lessonSchema],
});

const courseSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  tutor:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price:       { type: Number, required: true, min: 0 },
  category:    { type: String, required: true },
  level:       { type: String, enum: ['beginner','intermediate','advanced'], default: 'beginner' },
  language:    { type: String, default: 'Urdu' },
  thumbnail:   { type: String, default: '' },
  thumbnailPublicId: String,
  sections:    [sectionSchema],
  // legacy flat lessons support
  lessons:     [lessonSchema],
  isPublished: { type: Boolean, default: false },
  isApproved:  { type: Boolean, default: false },
  isFeatured:  { type: Boolean, default: false },
  rating:      { type: Number, default: 0 },
  totalReviews:  { type: Number, default: 0 },
  totalStudents: { type: Number, default: 0 },
  tags: [String],
  whatYouLearn: [String],
  requirements: [String],
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
