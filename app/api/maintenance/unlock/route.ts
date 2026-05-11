import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const { pin } = await req.json();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('shop_settings')
    .select('value')
    .eq('key', 'maintenance_pin')
    .single();

  const correctPin = (data as { value: string } | null)?.value ?? '1234';

  if (String(pin) !== String(correctPin)) {
    return NextResponse.json({ error: 'Code incorrect' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('maintenance_bypass', correctPin, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });
  return res;
}
