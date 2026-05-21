import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const { id, action } = await req.json();
  if (!id || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const supabase = createAdminClient();

  if (action === 'approve') {
    await supabase.from('reviews' as never).update({ is_approved: true } as never).eq('id', id);
  } else if (action === 'reject') {
    await supabase.from('reviews' as never).update({ is_approved: false } as never).eq('id', id);
  } else if (action === 'delete') {
    await supabase.from('reviews' as never).delete().eq('id', id);
  }

  return NextResponse.json({ ok: true });
}
