import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyUnsubscribeToken } from '@/lib/newsletter/token';

// RFC 8058 one-click unsubscribe for scheduled messages.
export async function POST(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  const token = req.nextUrl.searchParams.get('token');
  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return new NextResponse(null, { status: 400 });
  }
  const { error } = await createAdminClient().from('newsletter_subscribers')
    .update({ unsubscribed_at: new Date().toISOString() } as never)
    .eq('email', email.toLowerCase()).is('unsubscribed_at', null);
  return new NextResponse(null, { status: error ? 503 : 204 });
}

export async function GET(req: NextRequest) {
  const admin = createAdminClient();
  const email = req.nextUrl.searchParams.get('email');
  const token = req.nextUrl.searchParams.get('token');

  if (!email || !token) {
    return NextResponse.redirect(new URL('/newsletter/desinscription?status=error', req.url));
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return NextResponse.redirect(new URL('/newsletter/desinscription?status=error', req.url));
  }

  const { error } = await admin
    .from('newsletter_subscribers')
    .update({ unsubscribed_at: new Date().toISOString() } as never)
    .eq('email', email.toLowerCase())
    .is('unsubscribed_at', null);

  if (error) {
    console.error('[NEWSLETTER] Erreur désinscription:', error);
    return NextResponse.redirect(new URL('/newsletter/desinscription?status=error', req.url));
  }

  return NextResponse.redirect(new URL('/newsletter/desinscription?status=ok', req.url));
}
