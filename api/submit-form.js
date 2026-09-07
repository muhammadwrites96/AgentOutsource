const { sql, ensureSchema } = require('./_lib/db');
const { parseUserAgent } = require('./_lib/ua');
const { sendSubmissionNotification } = require('./_lib/email');

function first(headerValue) {
  if (!headerValue) return null;
  return Array.isArray(headerValue) ? headerValue[0] : String(headerValue).split(',')[0].trim();
}

function decodeHeader(value) {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toInt(value) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? safeJsonParse(req.body) : req.body || {};

  const name = (body.name || '').toString().trim();
  const email = (body.email || '').toString().trim();

  if (!name || !email) {
    return res.status(400).json({ ok: false, error: 'Name and email are required.' });
  }

  const h = req.headers;
  const ip = first(h['x-vercel-forwarded-for'] || h['x-forwarded-for']) || first(h['x-real-ip']);
  const ua = h['user-agent'] || null;
  const { browser, os, deviceType } = parseUserAgent(ua);

  const entry = {
    name,
    email,
    company: (body.company || '').toString().trim() || null,
    role: (body.role || '').toString().trim() || null,
    details: (body.details || '').toString().trim() || null,

    ip: ip || null,
    country: h['x-vercel-ip-country'] || null,
    region: h['x-vercel-ip-country-region'] || null,
    city: decodeHeader(h['x-vercel-ip-city']) || null,
    postal_code: h['x-vercel-ip-postal-code'] || null,
    latitude: h['x-vercel-ip-latitude'] || null,
    longitude: h['x-vercel-ip-longitude'] || null,
    timezone: h['x-vercel-ip-timezone'] || null,
    continent: h['x-vercel-ip-continent'] || null,

    user_agent: ua,
    browser,
    os,
    device_type: deviceType,
    referer: h['referer'] || null,
    page_url: body.pageUrl || null,
    language: h['accept-language'] || null,

    utm_source: body.utm_source || null,
    utm_medium: body.utm_medium || null,
    utm_campaign: body.utm_campaign || null,
    utm_term: body.utm_term || null,
    utm_content: body.utm_content || null,

    screen_width: toInt(body.screenWidth),
    screen_height: toInt(body.screenHeight),
    viewport_width: toInt(body.viewportWidth),
    viewport_height: toInt(body.viewportHeight),
    client_timezone: body.clientTimezone || null,

    vercel_request_id: h['x-vercel-id'] || null,
  };

  try {
    await ensureSchema();

    const result = await sql`
      INSERT INTO submissions (
        name, email, company, role, details,
        ip, country, region, city, postal_code, latitude, longitude, timezone, continent,
        user_agent, browser, os, device_type, referer, page_url, language,
        utm_source, utm_medium, utm_campaign, utm_term, utm_content,
        screen_width, screen_height, viewport_width, viewport_height, client_timezone,
        vercel_request_id
      ) VALUES (
        ${entry.name}, ${entry.email}, ${entry.company}, ${entry.role}, ${entry.details},
        ${entry.ip}, ${entry.country}, ${entry.region}, ${entry.city}, ${entry.postal_code}, ${entry.latitude}, ${entry.longitude}, ${entry.timezone}, ${entry.continent},
        ${entry.user_agent}, ${entry.browser}, ${entry.os}, ${entry.device_type}, ${entry.referer}, ${entry.page_url}, ${entry.language},
        ${entry.utm_source}, ${entry.utm_medium}, ${entry.utm_campaign}, ${entry.utm_term}, ${entry.utm_content},
        ${entry.screen_width}, ${entry.screen_height}, ${entry.viewport_width}, ${entry.viewport_height}, ${entry.client_timezone},
        ${entry.vercel_request_id}
      )
      RETURNING created_at;
    `;

    entry.created_at = result.rows[0]?.created_at;
  } catch (err) {
    console.error('Failed to save submission:', err);
    return res.status(500).json({ ok: false, error: 'Failed to save submission.' });
  }

  // Don't let an email failure block the user from seeing success —
  // the entry is already safely stored in the database.
  try {
    await sendSubmissionNotification(entry);
  } catch (err) {
    console.error('Failed to send notification email:', err);
  }

  return res.status(200).json({ ok: true });
};

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}
