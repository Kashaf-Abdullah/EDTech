// Detects and masks contact info in community messages.
// Goal: stop people moving conversations off-platform (and dodging tutor "must be enrolled" rules).

// Matches emails: name@domain.com
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Matches phone-like sequences: handles spaces, dashes, dots, parentheses, optional +country code.
// Requires at least 7 digits total to avoid false positives on short numbers (e.g. "10 students").
const PHONE_REGEX = /(\+?\d[\d\-.\s()]{6,}\d)/g;

// Pakistani-style numbers written with words to dodge filters, e.g. "zero three double one"
// We keep this simple — catching digit-based attempts covers the overwhelming majority.

const countDigits = (str) => (str.match(/\d/g) || []).length;

function filterContactInfo(text) {
  let masked = text;
  let wasMasked = false;

  masked = masked.replace(EMAIL_REGEX, () => {
    wasMasked = true;
    return '[email hidden]';
  });

  masked = masked.replace(PHONE_REGEX, (match) => {
    if (countDigits(match) >= 7) {
      wasMasked = true;
      return '[number hidden]';
    }
    return match; // leave short number-ish strings alone (e.g. "100 marks")
  });

  return { text: masked, wasMasked };
}

module.exports = { filterContactInfo };
