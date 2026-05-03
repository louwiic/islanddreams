import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = createAdminClient();

  const record = {
    title: body.title,
    subtitle: body.subtitle || null,
    image_url: body.image_url || null,
    cta_text: body.cta_text || 'Découvrir',
    cta_link: body.cta_link || '/boutique',
    start_date: body.start_date,
    end_date: body.end_date,
    priority: body.priority ?? 0,
    is_active: body.is_active ?? true,
  };

  if (body.id) {
    await supabase
      .from('hero_banners' as never)
      .update(record as never)
      .eq('id', body.id);
  } else {
    await supabase
      .from('hero_banners' as never)
      .insert(record as never);
  }

  return NextResponse.json({ ok: true });
}
