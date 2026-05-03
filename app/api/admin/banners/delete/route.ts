import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const { id } = await req.json();
  const supabase = createAdminClient();

  await supabase
    .from('hero_banners' as never)
    .delete()
    .eq('id', id);

  return NextResponse.json({ ok: true });
}
