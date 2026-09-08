const { sql, ensureSchema } = require('../_lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const password = req.headers['x-admin-password'];
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return res.status(500).json({ ok: false, error: 'ADMIN_PASSWORD is not configured on the server.' });
  }
  if (!password || password !== expected) {
    return res.status(401).json({ ok: false, error: 'Invalid password.' });
  }

  try {
    await ensureSchema();
    const [submissions, subscribers] = await Promise.all([
      sql`SELECT * FROM submissions ORDER BY created_at DESC LIMIT 500;`,
      sql`SELECT * FROM subscribers ORDER BY created_at DESC LIMIT 500;`,
    ]);
    return res.status(200).json({
      ok: true,
      entries: submissions.rows,
      subscribers: subscribers.rows,
    });
  } catch (err) {
    console.error('Failed to load submissions:', err);
    return res.status(500).json({ ok: false, error: 'Failed to load submissions.' });
  }
};
