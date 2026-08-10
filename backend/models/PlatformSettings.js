const mongoose = require('mongoose');

// Singleton-style settings document — there's only ever one of these.
const platformSettingsSchema = new mongoose.Schema({
  adminSignature:   { type: String, default: '' }, // Cloudinary URL
  adminName:        { type: String, default: 'Platform Director' },
  adminDesignation: { type: String, default: 'CEO, EduPak' },
  platformName:     { type: String, default: 'EduPak' },
  platformLogo:     { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
