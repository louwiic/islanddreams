import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe/client';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false });
    }

    const stripe = getStripeClient();

    // Chercher le code promo dans Stripe
    const promoCodes = await stripe.promotionCodes.list({
      code: code.toUpperCase(),
      active: true,
      limit: 1,
    });

    if (promoCodes.data.length === 0) {
      return NextResponse.json({ valid: false });
    }

    const promo = promoCodes.data[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coupon = (promo as any).coupon;

    // Construire le label
    let label = '';
    if (coupon.percent_off) {
      label = `-${coupon.percent_off}%`;
    } else if (coupon.amount_off) {
      label = `-${(coupon.amount_off / 100).toFixed(2)} €`;
    }
    if (coupon.name) {
      label += ` — ${coupon.name}`;
    }

    return NextResponse.json({ valid: true, label, promoCodeId: promo.id });
  } catch (error) {
    console.error('[PROMO] Erreur validation:', error);
    return NextResponse.json({ valid: false });
  }
}
