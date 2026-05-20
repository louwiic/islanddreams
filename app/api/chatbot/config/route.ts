import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('chatbot_config' as never)
    .select('*')
    .limit(1)
    .single();

  if (!data) {
    return NextResponse.json({ is_enabled: false });
  }

  return NextResponse.json(data);
}
