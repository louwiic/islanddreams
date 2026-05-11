import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const { enabled, pin } = await req.json();
  const supabase = createAdminClient();

  await Promise.all([
    supabase
      .from('shop_settings')
      .upsert({ key: 'maintenance_mode', value: String(enabled) }, { onConflict: 'key' }),
    supabase
      .from('shop_settings')
      .upsert({ key: 'maintenance_pin', value: String(pin) }, { onConflict: 'key' }),
  ]);

  return NextResponse.json({ ok: true });
}
