import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || '';
  if (token) await (createAdminClient() as any).from('abandoned_carts').update({ status: 'cancelled', next_reminder_at: null, updated_at: new Date().toISOString() }).eq('recovery_token', token);
  return NextResponse.redirect(new URL('/panier?reminders=off', request.url));
}
