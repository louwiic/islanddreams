import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendResendEmail, addContactToAudience } from '@/lib/email/resend';
import { newsletterWelcome } from '@/lib/email/templates';

const PROMO_CODE = 'BIENVENUE10'; // À créer dans Stripe dashboard (10% off)

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  }

  // Si déjà inscrit mais désinscrit → réinscrire
  const { data: existing } = await admin
    .from('newsletter_subscribers' as any)
    .select('id, unsubscribed_at')
    .eq('email', email.toLowerCase())
    .single();

  console.log(`[NEWSLETTER] Email reçu: ${email.toLowerCase()}, existant:`, existing);

  if (existing) {
    if (existing.unsubscribed_at) {
      console.log(`[NEWSLETTER] Réinscription (était désinscrit)`);
      await admin
        .from('newsletter_subscribers' as any)
        .update({ unsubscribed_at: null } as never)
        .eq('id', existing.id);
    } else {
      console.log(`[NEWSLETTER] Déjà inscrit, pas d'envoi`);
      return NextResponse.json({ code: PROMO_CODE, already: true });
    }
  } else {
    console.log(`[NEWSLETTER] Nouvel abonné, insertion en base...`);
    const { error } = await admin
      .from('newsletter_subscribers' as any)
      .insert({ email: email.toLowerCase(), promo_sent: true } as never)
      .select()
      .single();

    if (error) {
      console.error(`[NEWSLETTER] Erreur insertion:`, error);
      if (error.code === '23505') {
        return NextResponse.json({ code: PROMO_CODE, already: true });
      }
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
  }

  // Ajouter dans Resend Audiences
  await addContactToAudience(email);

  // Email de bienvenue avec code promo (via Resend)
  const tpl = newsletterWelcome(email);
  console.log(`[NEWSLETTER] Envoi email bienvenue à ${email} via Resend...`);
  const result = await sendResendEmail({ to: email, ...tpl });
  console.log(`[NEWSLETTER] Résultat:`, result);

  return NextResponse.json({ code: PROMO_CODE });
}
