// Public events only. Never include customer details, query strings or payment tokens.
export const CONSENT_KEY = 'islanddreams_cookie_consent';
const DOMAIN = 'islanddreams.re';
const PRIVATE_PATH = /^\/(?:admin|api|auth|compte|connexion|inscription|mot-de-passe|reset-password|partenaire|newsletter)(?:\/|$)/i;

export function publicPageUrl(href: string): string | null {
  try {
    const url = new URL(href);
    if (!['islanddreams.re', 'www.islanddreams.re'].includes(url.hostname) ||
        url.protocol !== 'https:' || PRIVATE_PATH.test(url.pathname)) return null;
    // Normalise www and remove every query/fragment, including Stripe session IDs.
    return `https://${DOMAIN}${url.pathname}`;
  } catch { return null; }
}

export function referralOrigin(referrer: string): string | undefined {
  try {
    const url = new URL(referrer);
    return ['https:', 'http:'].includes(url.protocol) ? url.origin : undefined;
  } catch { return undefined; }
}

export function track(name: string, _properties?: Record<string, unknown>): boolean {
  void _properties;
  if (typeof window === 'undefined' || !/^[a-z][a-z0-9_]{0,79}$/.test(name)) return false;
  try {
    const endpoint = process.env.NEXT_PUBLIC_PLAUSIBLE_URL;
    if (!endpoint || localStorage.getItem(CONSENT_KEY) !== 'accepted' ||
        localStorage.getItem('plausible_ignore') === 'true' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return false;
    const url = publicPageUrl(window.location.href);
    if (!url) return false;
    // Deliberately discard arbitrary event properties: forms may contain personal data.
    void fetch(`${endpoint.replace(/\/$/, '')}/api/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      keepalive: true,
      body: JSON.stringify({ name, domain: DOMAIN, url, referrer: referralOrigin(document.referrer) }),
    }).catch(() => {});
    return true;
  } catch { return false; }
}
