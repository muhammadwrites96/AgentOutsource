// Best-effort, dependency-free User-Agent parsing. Good enough for
// "what browser/OS/device did this lead use" — not meant to be exhaustive.

function parseUserAgent(ua) {
  if (!ua) return { browser: null, os: null, deviceType: null };

  let browser = 'Other';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/opr\//i.test(ua) || /opera/i.test(ua)) browser = 'Opera';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';

  let os = 'Other';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac os x/i.test(ua) && !/iphone|ipad/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  let deviceType = 'desktop';
  if (/ipad|tablet/i.test(ua)) deviceType = 'tablet';
  else if (/mobi|iphone|android/i.test(ua)) deviceType = 'mobile';

  return { browser, os, deviceType };
}

module.exports = { parseUserAgent };
