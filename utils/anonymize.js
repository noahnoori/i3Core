// Basic anonymization helpers (regex-based). This is a best-effort filter — review for your data policy.
exports.anonymize = function (text) {
  if (!text) return '';
  let t = text;
  // emails
  t = t.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[redacted_email]');
  // urls
  t = t.replace(/https?:\/\/[^\s]+/g, '[redacted_url]');
  // phone numbers
  t = t.replace(/\+?\d[\d\s\-()]{6,}\d/g, '[redacted_phone]');
  // SSN-like
  t = t.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[redacted_ssn]');
  // long digit sequences
  t = t.replace(/\b\d{6,}\b/g, '[redacted_number]');
  // names heuristic: sequences of capitalized words (up to 3) — remove conservatively
  t = t.replace(/\b([A-Z][a-z]+\s){1,3}[A-Z][a-z]+\b/g, '[redacted_name]');
  // remove extra whitespace
  t = t.replace(/\s{2,}/g, ' ').trim();
  return t;
};
