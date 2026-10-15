import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PGBase OAuth exchange and email verification callbacks.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const requestedNext = searchParams.get('next') ?? '/compte';
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//') && !requestedNext.includes('\\') ? requestedNext : '/compte';

  try {
    const token = searchParams.get('token');
    if (token) {
      const { createServerAuth } = await import('@/lib/pgbase/auth');
      const { cookies } = await import('next/headers');
      await createServerAuth(await cookies()).verify(token);
      return NextResponse.redirect(`${origin}/compte/connexion?confirmed=1`);
    }
    if (code) {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next}`);
    }
  } catch { /* Invalid or expired one-time token. */ }

  return NextResponse.redirect(`${origin}/compte/connexion?error=auth`);
}
