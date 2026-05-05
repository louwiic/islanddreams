import { createHmac } from 'crypto';

const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'fallback-secret';

/** Génère un token HMAC pour valider la désinscription */
export function generateUnsubscribeToken(email: string): string {
  return createHmac('sha256', SECRET).update(email.toLowerCase()).digest('hex').slice(0, 32);
}

/** Vérifie que le token correspond à l'email */
export function verifyUnsubscribeToken(email: string, token: string): boolean {
  return generateUnsubscribeToken(email) === token;
}

/** Génère l'URL complète de désinscription */
export function unsubscribeUrl(email: string): string {
  const token = generateUnsubscribeToken(email);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.islanddreams.re';
  return `${base}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}
