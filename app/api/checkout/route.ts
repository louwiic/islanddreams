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

    const supabase = createAdminClient();

    // ── Valider les prix et le stock depuis la BDD ──────────────────────
    const productIds = items.map((i) => i.productId);
    const { data: dbProducts, error: dbError } = await supabase
      .from('products')
      .select('id, name, price, sale_price, manage_stock, stock_quantity, in_stock')
      .in('id', productIds);

    if (dbError || !dbProducts) {
      return NextResponse.json({ error: 'Impossible de vérifier les produits' }, { status: 500 });
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Vérifications : prix + stock
    for (const item of items) {
      const dbProd = productMap.get(item.productId);
      if (!dbProd) {
        return NextResponse.json(
          { error: `Produit introuvable : ${item.name}` },
          { status: 400 },
        );
      }
      if (!dbProd.in_stock) {
        return NextResponse.json(
          { error: `"${dbProd.name}" n'est plus disponible` },
          { status: 400 },
        );
      }
      if (dbProd.manage_stock && dbProd.stock_quantity !== null) {
        if (item.quantity > dbProd.stock_quantity) {
          return NextResponse.json(
            {
              error: `Stock insuffisant pour "${dbProd.name}" (dispo : ${dbProd.stock_quantity})`,
            },
            { status: 400 },
          );
        }
      }
    }

    // ── Construire les line items avec les prix de la BDD ───────────────
    const lineItems = items.map((item) => {
      const dbProd = productMap.get(item.productId)!;
      // Prix réel : promo si dispo, sinon prix de base
      const unitPrice = dbProd.sale_price ?? dbProd.price;

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name + (item.variantLabel ? ` — ${item.variantLabel}` : ''),
            ...(item.image ? { images: [item.image] } : {}),
            metadata: {
              productId: item.productId,
              variantId: item.variantId || '',
              variantLabel: item.variantLabel || '',
            },
          },
          unit_amount: Math.round(unitPrice * 100),
        },
        quantity: item.quantity,
      };
    });

    // ── Frais de livraison ──────────────────────────────────────────────
    if (shippingMethodId) {
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
              metadata: { productId: '', variantId: '', variantLabel: '' },
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
