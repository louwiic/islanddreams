import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const { id, is_active } = await req.json();
  const supabase = createAdminClient();

  await supabase
    .from('hero_banners' as never)
    .update({ is_active } as never)
    .eq('id', id);

  return NextResponse.json({ ok: true });
}
