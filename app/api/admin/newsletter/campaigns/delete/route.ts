import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const admin = createAdminClient();
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
  }

  const { error } = await admin
    .from('newsletter_campaigns')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
