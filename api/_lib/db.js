const { sql } = require('@vercel/postgres');

let ensured = false;

// Idempotent — safe to call on every request. Only actually hits the DB
// once per warm serverless instance thanks to the `ensured` flag.
async function ensureSchema() {
  if (ensured) return;
  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

      -- form fields
      name TEXT,
      email TEXT,
      company TEXT,
      role TEXT,
      details TEXT,

      -- network / geo (from Vercel's edge geolocation headers)
      ip TEXT,
      country TEXT,
      region TEXT,
      city TEXT,
      postal_code TEXT,
      latitude TEXT,
      longitude TEXT,
      timezone TEXT,
      continent TEXT,

      -- request / device context
      user_agent TEXT,
      browser TEXT,
      os TEXT,
      device_type TEXT,
      referer TEXT,
      page_url TEXT,
      language TEXT,

      -- attribution
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_term TEXT,
      utm_content TEXT,

      -- client-reported context
      screen_width INTEGER,
      screen_height INTEGER,
      viewport_width INTEGER,
      viewport_height INTEGER,
      client_timezone TEXT,

      -- tracing
      vercel_request_id TEXT
    );
  `;
  ensured = true;
}

module.exports = { sql, ensureSchema };
