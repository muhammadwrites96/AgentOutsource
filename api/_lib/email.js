const nodemailer = require('nodemailer');

function getTransport() {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error('GMAIL_USER / GMAIL_APP_PASSWORD env vars are not set.');
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });
}

async function sendSubmissionNotification(entry) {
  const to = process.env.NOTIFY_EMAIL || 'agentoutsourceofficial@gmail.com';
  const transport = getTransport();

  const row = (label, value) =>
    value ? `<tr><td style="padding:4px 12px 4px 0;color:#666;white-space:nowrap;">${label}</td><td style="padding:4px 0;"><strong>${escapeHtml(String(value))}</strong></td></tr>` : '';

  const html = `
    <h2 style="margin:0 0 12px;">New contact form submission</h2>
    <table cellspacing="0" cellpadding="0" style="font-family:sans-serif;font-size:14px;">
      ${row('Name', entry.name)}
      ${row('Email', entry.email)}
      ${row('Company', entry.company)}
      ${row('Role needed', entry.role)}
      ${row('Details', entry.details)}
      ${row('Location', [entry.city, entry.region, entry.country].filter(Boolean).join(', '))}
      ${row('Timezone', entry.timezone)}
      ${row('IP', entry.ip)}
      ${row('Browser / OS', [entry.browser, entry.os].filter(Boolean).join(' / '))}
      ${row('Device', entry.device_type)}
      ${row('Referrer', entry.referer)}
      ${row('Page URL', entry.page_url)}
      ${row('UTM source', entry.utm_source)}
      ${row('UTM medium', entry.utm_medium)}
      ${row('UTM campaign', entry.utm_campaign)}
      ${row('Submitted at', entry.created_at)}
    </table>
  `;

  await transport.sendMail({
    from: `Agent Outsource Website <${process.env.GMAIL_USER}>`,
    to,
    replyTo: entry.email || undefined,
    subject: `New lead: ${entry.name || 'Unknown'}${entry.company ? ' — ' + entry.company : ''}`,
    html,
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendSubscriberNotification(entry) {
  const to = process.env.NOTIFY_EMAIL || 'agentoutsourceofficial@gmail.com';
  const transport = getTransport();

  const row = (label, value) =>
    value ? `<tr><td style="padding:4px 12px 4px 0;color:#666;white-space:nowrap;">${label}</td><td style="padding:4px 0;"><strong>${escapeHtml(String(value))}</strong></td></tr>` : '';

  const html = `
    <h2 style="margin:0 0 12px;">New newsletter subscriber</h2>
    <table cellspacing="0" cellpadding="0" style="font-family:sans-serif;font-size:14px;">
      ${row('Email', entry.email)}
      ${row('Location', [entry.city, entry.region, entry.country].filter(Boolean).join(', '))}
      ${row('Page URL', entry.page_url)}
      ${row('Referrer', entry.referer)}
      ${row('Browser / OS', [entry.browser, entry.os].filter(Boolean).join(' / '))}
      ${row('UTM source', entry.utm_source)}
      ${row('UTM medium', entry.utm_medium)}
      ${row('UTM campaign', entry.utm_campaign)}
      ${row('Subscribed at', entry.created_at)}
    </table>
  `;

  await transport.sendMail({
    from: `Agent Outsource Website <${process.env.GMAIL_USER}>`,
    to,
    replyTo: entry.email || undefined,
    subject: `New subscriber: ${entry.email}`,
    html,
  });
}

module.exports = { sendSubmissionNotification, sendSubscriberNotification };
