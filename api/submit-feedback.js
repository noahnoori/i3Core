const { Pool } = require('pg');
const fetch = global.fetch || require('node-fetch');
const anonymize = require('../utils/anonymize');
const ai = require('../utils/ai');

const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  const { text, category='general' } = req.body || {};
  if (!text || typeof text !== 'string' || text.trim().length < 3) return res.status(400).json({ ok:false, error:'Invalid feedback' });

  // Redact obvious PII
  const redacted = anonymize.anonymize(text);

  // Summarize + sentiment using AI if available
  let summary = redacted.slice(0, 280);
  let sentiment = null;
  try {
    if (process.env.OPENAI_API_KEY) {
      const aiRes = await ai.summarizeAndSentiment(redacted);
      summary = aiRes.summary || summary;
      sentiment = aiRes.sentiment || null;
    }
  } catch (err) {
    console.error('AI error', err.message || err);
  }

  const anon_id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : require('crypto').randomBytes(8).toString('hex');
  const created_at = new Date(); // consider rounding

  if (pool) {
    try {
      const q = 'INSERT INTO feedback(id, anon_id, text_redacted, summary, category, sentiment, created_at) VALUES($1,$2,$3,$4,$5,$6,$7)';
      const id = anon_id + '-' + Date.now();
      await pool.query(q, [id, anon_id, redacted, summary, category, sentiment, created_at.toISOString()]);
    } catch (err) { console.error('DB error', err); }
  } else {
    console.log('Feedback (no DB):', { anon_id, summary, category });
  }

  return res.status(200).json({ ok:true });
};
