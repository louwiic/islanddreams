import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/send';
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
    .from('newsletter_subscribers')
    .select('id, unsubscribed_at')
    .eq('email', email.toLowerCase())
    .single();

  if (existing) {
    if (existing.unsubscribed_at) {
      await admin
        .from('newsletter_subscribers')
        .update({ unsubscribed_at: null } as never)
        .eq('id', existing.id);
    } else {
      return NextResponse.json({ code: PROMO_CODE, already: true });
    }
  } else {
    const { error } = await admin
      .from('newsletter_subscribers')
      .insert({ email: email.toLowerCase(), promo_sent: true } as never)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ code: PROMO_CODE, already: true });
      }
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
  }

  // Email de bienvenue avec code promo
  const tpl = newsletterWelcome(email);
  console.log(`[NEWSLETTER] Envoi email bienvenue à ${email}...`);
  const result = await sendEmail({ to: email, ...tpl });
  console.log(`[NEWSLETTER] Résultat:`, result);

  return NextResponse.json({ code: PROMO_CODE });
}
