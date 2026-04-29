import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

  const { error } = await admin
    .from('newsletter_subscribers')
    .insert({ email, promo_sent: true })
    .select()
    .single();

  if (error) {
    // Email déjà inscrit
    if (error.code === '23505') {
      return NextResponse.json({ code: PROMO_CODE, already: true });
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }

  return NextResponse.json({ code: PROMO_CODE });
}
