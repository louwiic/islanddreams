import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { faqs } = await req.json();
  const supabase = createAdminClient();

  // Delete all existing FAQs
  await supabase.from('site_faqs' as never).delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Insert new ones
  if (Array.isArray(faqs) && faqs.length > 0) {
    await supabase.from('site_faqs' as never).insert(
      faqs.map((f: { question: string; answer: string; position: number; is_active: boolean }) => ({
        question: f.question,
        answer: f.answer,
        position: f.position,
        is_active: f.is_active,
      })) as never
    );
  }

  return NextResponse.json({ ok: true });
}
