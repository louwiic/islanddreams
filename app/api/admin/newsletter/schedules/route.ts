import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { queueCommand, scheduleCampaign, type QueueState } from '@/lib/newsletter/queue';

async function authorized() {
  try { await requireAdmin(); return true; } catch { return false; }
}
export async function GET() {
  if (!await authorized()) return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 });
  try {
    const state = await queueCommand<QueueState>('list');
    return NextResponse.json({ ...state, enabled: process.env.NEWSLETTER_AUTOMATION_ENABLED === 'true' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'La planification doit être configurée sur le serveur avant utilisation.' }, { status: 503 });
  }
}
export async function POST(request: NextRequest) {
  if (!await authorized()) return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 });
  try {
    const result = await scheduleCampaign(await request.json());
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ error: 'Planification impossible. Vérifie l’objet, le contenu, la date (au moins une minute dans le futur) et la configuration du service.' }, { status: 400 });
  }
}
export async function DELETE(request: NextRequest) {
  if (!await authorized()) return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 });
  try {
    const { id } = await request.json();
    if (typeof id !== 'string' || !/^[a-f0-9-]{36}$/i.test(id)) return NextResponse.json({ error: 'Identifiant invalide.' }, { status: 400 });
    const result = await queueCommand<{ cancelled: boolean }>('cancel', { id });
    if (!result.cancelled) return NextResponse.json({ error: 'Seule une campagne encore en attente peut être annulée.' }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Annulation impossible.' }, { status: 500 }); }
}
