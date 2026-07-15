import { createClient } from '@/lib/supabase/server';

export function getAdminEmails() {
  return new Set([
    ...(process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
    'admin@islanddreams.re',
    'contact@islanddreams.re',
  ]);
}

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email?.toLowerCase();
  if (!email || !getAdminEmails().has(email)) {
    throw new Error('Accès administrateur requis.');
  }
  return user;
}
