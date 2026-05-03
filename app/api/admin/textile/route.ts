import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET — liste tous les produits textiles mis en avant
export async function GET() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('textile_highlights' as never)
    .select('*')
    .order('position', { ascending: true });

  return NextResponse.json(data ?? []);
}

// POST — ajouter ou modifier un produit textile
export async function POST(req: Request) {
  const body = await req.json();
  const supabase = createAdminClient();

  const record = {
    product_name: body.product_name,
    image_url: body.image_url,
    product_link: body.product_link || '/boutique',
    position: body.position ?? 0,
    is_active: body.is_active ?? true,
  };

  if (body.id) {
    await supabase
      .from('textile_highlights' as never)
      .update(record as never)
      .eq('id', body.id);
  } else {
    await supabase
      .from('textile_highlights' as never)
      .insert(record as never);
  }

  return NextResponse.json({ ok: true });
}

// DELETE — supprimer un produit textile
export async function DELETE(req: Request) {
  const { id } = await req.json();
  const supabase = createAdminClient();

  await supabase
    .from('textile_highlights' as never)
    .delete()
    .eq('id', id);

  return NextResponse.json({ ok: true });
}
