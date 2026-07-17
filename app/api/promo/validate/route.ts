import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { code, email, cartTotal } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false });
    }

    // Vérifications basées sur l'email
    if (email && typeof email === 'string') {
      const supabase = createAdminClient();
      const upperCode = code.toUpperCase();

      // Vérifier si abonné newsletter (requis pour BIENVENUE10)
      if (upperCode === 'BIENVENUE10') {
        const { data: subscriber } = await supabase
          .from('newsletter_subscribers')
          .select('id')
          .ilike('email', email.trim())
          .is('unsubscribed_at', null)
          .single();

        if (!subscriber) {
          console.log(`[PROMO] ${email} n'est pas abonné newsletter — code ${upperCode} refusé`);
          return NextResponse.json({ valid: false, reason: 'not_subscribed' });
        }
      }

      // Vérifier si ce code a déjà été utilisé par cet email
      const { data: existing } = await supabase
        .from('promo_usage')
        .select('id')
        .ilike('email', email.trim())
        .eq('promo_code', upperCode)
        .single();

      if (existing) {
        console.log(`[PROMO] Code ${upperCode} déjà utilisé par ${email}`);
        return NextResponse.json({ valid: false, reason: 'already_used' });
      }
    }

    const stripe = getStripeClient();

    // Chercher le code promo dans Stripe
    console.log(`[PROMO] Recherche: "${code.toUpperCase()}"`);
    const promoCodes = await stripe.promotionCodes.list({
      code: code.toUpperCase(),
      active: true,
      limit: 1,
    });

    if (promoCodes.data.length === 0) {
      // Chercher aussi les codes inactifs (déjà utilisé / expiré)
      const inactivePromos = await stripe.promotionCodes.list({
        code: code.toUpperCase(),
        limit: 1,
      });
      if (inactivePromos.data.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const expired = inactivePromos.data[0] as any;
        console.log(`[PROMO] Code trouvé mais inactif — active: ${expired.active}, times_redeemed: ${expired.times_redeemed}, max_redemptions: ${expired.max_redemptions}, expires_at: ${expired.expires_at}`);
        return NextResponse.json({ valid: false, reason: 'expired' });
      }
      console.log(`[PROMO] Code introuvable`);
      return NextResponse.json({ valid: false });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const promo = promoCodes.data[0] as any;
    console.log(`[PROMO] Code trouvé — id: ${promo.id}, active: ${promo.active}, times_redeemed: ${promo.times_redeemed}`);

    const validFrom = promo.metadata?.validFrom ? new Date(promo.metadata.validFrom) : null;
    if (validFrom && !Number.isNaN(validFrom.getTime()) && validFrom.getTime() > Date.now()) {
      return NextResponse.json({ valid: false, reason: 'not_started' });
    }
    const minimumAmount = Number(promo.restrictions?.minimum_amount || 0) / 100;
    if (minimumAmount > 0 && Number(cartTotal || 0) < minimumAmount) {
      return NextResponse.json({ valid: false, reason: 'minimum_amount', minimumAmount });
    }

    // Récupérer le coupon ID depuis promotion.coupon
    const couponId = promo.promotion?.coupon || promo.coupon;

    if (!couponId) {
      return NextResponse.json({ valid: true, label: 'Réduction appliquée', discount: {}, promoCodeId: promo.id });
    }

    // Récupérer les détails du coupon
    const resolvedId = typeof couponId === 'string' ? couponId : couponId.id;
    console.log(`[PROMO] Coupon ID: ${resolvedId}`);
    const coupon = await stripe.coupons.retrieve(resolvedId);
    console.log(`[PROMO] Coupon: percent_off=${coupon.percent_off}, amount_off=${coupon.amount_off}, name=${coupon.name}`);

    // Construire le label
    let label = '';
    const discount: { percentOff?: number; amountOff?: number } = {};

    if (coupon.percent_off) {
      label = `-${coupon.percent_off}%`;
      discount.percentOff = coupon.percent_off;
    } else if (coupon.amount_off) {
      label = `-${(coupon.amount_off / 100).toFixed(2)} €`;
      discount.amountOff = coupon.amount_off / 100;
    }
    if (coupon.name) {
      label += ` — ${coupon.name}`;
    }

    return NextResponse.json({ valid: true, label, discount, promoCodeId: promo.id });
  } catch (error) {
    console.error('[PROMO] Erreur validation:', error);
    return NextResponse.json({ valid: false });
  }
}
