import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendResendEmail } from '@/lib/email/resend';
import { campaignEmail } from '@/lib/email/templates';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
  }

  // Récupérer la campagne
  const { data: campaign, error: campErr } = await admin
    .from('newsletter_campaigns')
    .select('*')
    .eq('id', id)
    .eq('status', 'draft')
    .single();

  if (campErr || !campaign) {
    return NextResponse.json(
      { error: 'Campagne introuvable ou déjà envoyée' },
      { status: 404 },
    );
  }

  // Récupérer les abonnés actifs
  const { data: subscribers } = await admin
    .from('newsletter_subscribers')
    .select('email')
    .is('unsubscribed_at', null);

  const activeSubscribers = subscribers ?? [];

  if (activeSubscribers.length === 0) {
    return NextResponse.json(
      { error: 'Aucun abonné actif' },
      { status: 400 },
    );
  }

  // Envoyer à chaque abonné
  let sent = 0;
  for (const sub of activeSubscribers) {
    const tpl = campaignEmail(campaign.subject, campaign.content, sub.email);
    const result = await sendResendEmail({ to: sub.email, ...tpl });
    if (result.ok) sent++;
  }

  // Mettre à jour la campagne
  await admin
    .from('newsletter_campaigns')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      recipients_count: sent,
    } as never)
    .eq('id', id);

  return NextResponse.json({ ok: true, sent });
}
