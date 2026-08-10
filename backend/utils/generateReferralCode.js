const crypto = require('crypto');

// Short, URL-safe, human-shareable code like "AHM3X9K2"
const generateReferralCode = (name = '') => {
  const prefix = (name.replace(/[^a-zA-Z]/g, '').slice(0, 3) || 'USR').toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 5);
  return `${prefix}${random}`;
};

module.exports = generateReferralCode;
