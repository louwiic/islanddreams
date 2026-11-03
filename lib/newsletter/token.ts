import { createHmac, timingSafeEqual } from 'crypto';

// Preserve existing signed links when the legacy key is configured.
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || process.env.PGBASE_SECRET_KEY;

/** Génère un token HMAC pour valider la désinscription */
export function generateUnsubscribeToken(email: string): string {
  if (!SECRET) throw new Error('Signature de désinscription non configurée.');
  return createHmac('sha256', SECRET).update(email.toLowerCase()).digest('hex').slice(0, 32);
}

/** Vérifie que le token correspond à l'email */
export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!SECRET || !/^[a-f0-9]{32}$/.test(token)) return false;
  return timingSafeEqual(Buffer.from(generateUnsubscribeToken(email)), Buffer.from(token));
}

/** Génère l'URL complète de désinscription */
export function unsubscribeUrl(email: string): string {
  const token = generateUnsubscribeToken(email);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.islanddreams.re';
  return `${base}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}
