import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyUnsubscribeToken } from '@/lib/newsletter/token';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  const token = req.nextUrl.searchParams.get('token');

  if (!email || !token) {
    return NextResponse.redirect(new URL('/newsletter/desinscription?status=error', req.url));
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return NextResponse.redirect(new URL('/newsletter/desinscription?status=error', req.url));
  }

  const { error } = await admin
    .from('newsletter_subscribers' as any)
    .update({ unsubscribed_at: new Date().toISOString() } as never)
    .eq('email', email.toLowerCase())
    .is('unsubscribed_at', null);

  if (error) {
    console.error('[NEWSLETTER] Erreur désinscription:', error);
    return NextResponse.redirect(new URL('/newsletter/desinscription?status=error', req.url));
  }

  return NextResponse.redirect(new URL('/newsletter/desinscription?status=ok', req.url));
}
