const { Pool } = require('pg');
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;

module.exports = async (req, res) => {
  const token = req.headers['x-admin-token'];
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  if (!pool) return res.status(500).json({ error: 'Database not configured' });

  try {
    const q = 'SELECT id, summary, category, sentiment, created_at FROM feedback ORDER BY created_at DESC LIMIT 200';
    const r = await pool.query(q);
    return res.status(200).json({ rows: r.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Query failed' });
  }
};
