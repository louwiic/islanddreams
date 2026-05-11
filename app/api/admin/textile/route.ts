import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('textile_highlights' as never)
    .select('id, position, is_active, product:product_id(id, name, slug)')
    .order('position', { ascending: true });

  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = createAdminClient();

  if (body.id) {
    // Mise à jour position/activation
    await supabase
      .from('textile_highlights' as never)
      .update({ position: body.position, is_active: body.is_active } as never)
      .eq('id', body.id);
  } else {
    // Ajout d'un nouveau produit
    const { data: existing } = await supabase
      .from('textile_highlights' as never)
      .select('position')
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = existing && (existing as unknown as { position: number }[]).length > 0
      ? (existing as unknown as { position: number }[])[0].position + 1
      : 0;

    await supabase
      .from('textile_highlights' as never)
      .insert({ product_id: body.product_id, position: nextPosition, is_active: true } as never);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const supabase = createAdminClient();

  await supabase
    .from('textile_highlights' as never)
    .delete()
    .eq('id', id);

  return NextResponse.json({ ok: true });
}
