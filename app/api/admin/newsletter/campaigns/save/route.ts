import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const admin = createAdminClient();
  const { id, subject, content } = await req.json();

  if (!subject?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Objet et contenu requis' }, { status: 400 });
  }

  if (id) {
    // Mise à jour d'un brouillon existant
    const { data, error } = await admin
      .from('newsletter_campaigns')
      .update({ subject, content } as never)
      .eq('id', id)
      .eq('status', 'draft')
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ campaign: data });
  }

  // Création d'un nouveau brouillon
  const { data, error } = await admin
    .from('newsletter_campaigns')
    .insert({ subject, content, status: 'draft' } as never)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ campaign: data });
}
