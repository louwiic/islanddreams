import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from('chatbot_config' as never)
    .select('id')
    .limit(1)
    .single();

  const id = (existing as { id: string } | null)?.id;

  if (id) {
    await supabase
      .from('chatbot_config' as never)
      .update(body as never)
      .eq('id', id);
  } else {
    await supabase
      .from('chatbot_config' as never)
      .insert(body as never);
  }

  return NextResponse.json({ ok: true });
}
