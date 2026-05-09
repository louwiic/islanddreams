import { NextRequest, NextResponse } from 'next/server';
import { sendBroadcast } from '@/lib/email/resend';

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    const result = await sendBroadcast(id);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
