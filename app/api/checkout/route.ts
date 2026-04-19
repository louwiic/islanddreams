import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/admin';
import type { CartItem } from '@/lib/cart/types';

type CheckoutBody = {
  items: CartItem[];
  shippingMethodId?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { items, shippingMethodId } = (await req.json()) as CheckoutBody;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name + (item.variantLabel ? ` — ${item.variantLabel}` : ''),
          ...(item.image ? { images: [item.image] } : {}),
          metadata: {
            productId: item.productId,
            variantId: item.variantId || '',
          },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Ajouter les frais de livraison si une méthode est sélectionnée
    if (shippingMethodId) {
      const supabase = createAdminClient();
      const { data: method } = await supabase
        .from('shipping_methods')
        .select('name, cost')
        .eq('id', shippingMethodId)
        .single();

      if (method && method.cost > 0) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Livraison — ${method.name}`,
              metadata: { productId: '', variantId: '' },
            },
            unit_amount: Math.round(method.cost * 100),
          },
          quantity: 1,
        });
      }
    }

    const origin = req.headers.get('origin') || 'https://www.islanddreams.re';

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ['FR', 'RE'],
      },
      locale: 'fr',
      success_url: `${origin}/checkout/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/annule`,
      metadata: {
        source: 'island-dreams-web',
        shippingMethodId: shippingMethodId || '',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('Stripe checkout error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
