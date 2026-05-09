import { NextRequest, NextResponse } from 'next/server';
import { createBroadcast, listBroadcasts, removeBroadcast } from '@/lib/email/resend';

// GET — liste des campagnes
export async function GET() {
  try {
    const broadcasts = await listBroadcasts();
    return NextResponse.json({ broadcasts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST — créer une campagne
export async function POST(req: NextRequest) {
  try {
    const { subject, html } = await req.json();
    if (!subject || !html) {
      return NextResponse.json({ error: 'Sujet et contenu requis' }, { status: 400 });
    }
    const broadcast = await createBroadcast(subject, html);
    return NextResponse.json({ broadcast });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — supprimer une campagne
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    await removeBroadcast(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
