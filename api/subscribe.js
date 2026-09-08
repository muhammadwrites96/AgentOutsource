const { sql, ensureSchema } = require('./_lib/db');
const { parseUserAgent } = require('./_lib/ua');
const { sendSubscriberNotification } = require('./_lib/email');

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

// Deliberately permissive: something@something.tld. Anything stricter starts
// rejecting valid addresses, and the real test is whether mail lands.
function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? safeJsonParse(req.body) : req.body || {};
  const email = (body.email || '').toString().trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ ok: false, error: 'Please enter your email address.' });
  }
  if (email.length > 254 || !looksLikeEmail(email)) {
    return res.status(400).json({ ok: false, error: 'That does not look like a valid email address.' });
  }

  const h = req.headers;
  const ip = first(h['x-vercel-forwarded-for'] || h['x-forwarded-for']) || first(h['x-real-ip']);
  const ua = h['user-agent'] || null;
  const { browser, os, deviceType } = parseUserAgent(ua);

  const entry = {
    email,
    ip: ip || null,
    country: h['x-vercel-ip-country'] || null,
    region: h['x-vercel-ip-country-region'] || null,
    city: decodeHeader(h['x-vercel-ip-city']) || null,

    user_agent: ua,
    browser,
    os,
    device_type: deviceType,
    referer: h['referer'] || null,
    page_url: body.pageUrl || null,

    utm_source: body.utm_source || null,
    utm_medium: body.utm_medium || null,
    utm_campaign: body.utm_campaign || null,

    vercel_request_id: h['x-vercel-id'] || null,
  };

  let alreadySubscribed = false;

  try {
    await ensureSchema();

    // ON CONFLICT keeps re-subscribing harmless: no duplicate row, no error,
    // and the original signup date is preserved.
    const result = await sql`
      INSERT INTO subscribers (
        email,
        ip, country, region, city,
        user_agent, browser, os, device_type, referer, page_url,
        utm_source, utm_medium, utm_campaign,
        vercel_request_id
      ) VALUES (
        ${entry.email},
        ${entry.ip}, ${entry.country}, ${entry.region}, ${entry.city},
        ${entry.user_agent}, ${entry.browser}, ${entry.os}, ${entry.device_type}, ${entry.referer}, ${entry.page_url},
        ${entry.utm_source}, ${entry.utm_medium}, ${entry.utm_campaign},
        ${entry.vercel_request_id}
      )
      ON CONFLICT (email) DO NOTHING
      RETURNING created_at;
    `;

    if (result.rows.length === 0) {
      alreadySubscribed = true;
    } else {
      entry.created_at = result.rows[0].created_at;
    }
  } catch (err) {
    console.error('Failed to save subscriber:', err);
    return res.status(500).json({ ok: false, error: 'Something went wrong. Please try again.' });
  }

  // Only notify on a genuinely new subscriber, and never let a mail failure
  // turn a successful signup into an error for the visitor.
  if (!alreadySubscribed) {
    try {
      await sendSubscriberNotification(entry);
    } catch (err) {
      console.error('Failed to send subscriber notification email:', err);
    }
  }

  return res.status(200).json({ ok: true, alreadySubscribed });
};

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}
