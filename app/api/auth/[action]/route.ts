import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerAuth } from '@/lib/pgbase/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: { message: 'Origine refusée' } }, { status: 403 });
  try {
    const { action } = await params;
    const input = await request.json();
    const auth = createServerAuth(await cookies());
    let result;
    switch (action) {
      case 'signin': result = await auth.signInWithPassword(input); break;
      case 'signup': result = await auth.signUp(input); break;
      case 'signout': result = await auth.signOut(); break;
      case 'refresh': result = await auth.refresh(); break;
      case 'user': result = await auth.getUser(); break;
      case 'reset': result = await auth.resetPasswordForEmail(input.email); break;
      case 'update': result = await auth.updateUser(input); break;
      case 'exchange': result = await auth.exchangeCodeForSession(input.code); break;
      case 'verify': result = await auth.verify(input.token); break;
      default: return NextResponse.json({ error: { message: 'Action inconnue' } }, { status: 404 });
    }
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = (error as { status?: number }).status || 400;
    const message = status === 401 && request.nextUrl.pathname.endsWith('/signin')
      ? 'Invalid login credentials'
      : error instanceof Error ? error.message : 'Connexion impossible';
    return NextResponse.json({ data: { user: null, session: null }, error: { message } }, { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
