import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/admin';
import type { CartItem } from '@/lib/cart/types';

type CheckoutBody = {
  items: CartItem[];
  shippingMethodId?: string;
  promoCode?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    };
  };
};

function settingToString(value: unknown) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);
  return '';
}

export async function POST(req: NextRequest) {
  try {
    const { items, shippingMethodId, promoCode, customer } = (await req.json()) as CheckoutBody;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
    }

    if (
      !customer?.name?.trim() ||
      !customer.email?.trim() ||
      !customer.phone?.trim() ||
      !customer.address?.line1?.trim() ||
      !customer.address.city?.trim() ||
      !customer.address.postalCode?.trim()
    ) {
      return NextResponse.json({ error: 'Coordonnées de livraison incomplètes' }, { status: 400 });
    }

    if (!shippingMethodId) {
      return NextResponse.json({ error: 'Mode de livraison requis' }, { status: 400 });
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
    const validatedSubtotal = items.reduce((sum, item) => {
      const dbProd = productMap.get(item.productId);
      const unitPrice = dbProd ? dbProd.sale_price ?? dbProd.price : 0;
      return sum + unitPrice * item.quantity;
    }, 0);

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

    // ── Cadeau automatique selon palier panier ─────────────────────────
    let giftMetadata = {
      giftProductId: '',
      giftProductName: '',
      giftProductSlug: '',
    };

    const { data: giftSettingsData } = await supabase
      .from('shop_settings')
      .select('key, value')
      .in('key', [
        'gift_offer_enabled',
        'gift_offer_min_amount',
        'gift_offer_product_slug',
      ]);

    const giftSettings = Object.fromEntries(
      ((giftSettingsData ?? []) as { key: string; value: unknown }[]).map((row) => [
        row.key,
        settingToString(row.value),
      ])
    );
    const giftEnabled =
      giftSettings.gift_offer_enabled === 'true' || giftSettings.gift_offer_enabled === '1';
    const giftMinAmount = Number(
      String(giftSettings.gift_offer_min_amount || '0').replace(',', '.')
    );
    const giftProductSlug = giftSettings.gift_offer_product_slug || '';

    if (
      giftEnabled &&
      giftProductSlug &&
      Number.isFinite(giftMinAmount) &&
      giftMinAmount > 0 &&
      validatedSubtotal >= giftMinAmount
    ) {
      const { data: giftProduct } = await supabase
        .from('products')
        .select('id, name, slug, status, in_stock, manage_stock, stock_quantity')
        .eq('slug', giftProductSlug)
        .maybeSingle();

      if (giftProduct?.in_stock) {
        const purchasedGiftQuantity = items
          .filter((item) => item.productId === giftProduct.id)
          .reduce((sum, item) => sum + item.quantity, 0);
        const giftStockOk =
          !giftProduct.manage_stock ||
          giftProduct.stock_quantity === null ||
          giftProduct.stock_quantity > purchasedGiftQuantity;

        if (giftStockOk) {
          giftMetadata = {
            giftProductId: giftProduct.id,
            giftProductName: giftProduct.name,
            giftProductSlug: giftProduct.slug,
          };
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
    let selectedShippingCost = 0;
    let selectedShippingName = '';
    if (shippingMethodId) {
      const { data: method } = await supabase
        .from('shipping_methods')
        .select('name, cost')
        .eq('id', shippingMethodId)
        .single();

      if (!method) {
        return NextResponse.json({ error: 'Mode de livraison introuvable' }, { status: 400 });
      }

      selectedShippingCost = method.cost;
      selectedShippingName = method.name;

      if (method.cost > 0) {
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

    // ── Code promo Stripe ──────────────────────────────────────────────
    let discounts: { promotion_code: string }[] | undefined;
    if (promoCode) {
      const promoCodes = await stripe.promotionCodes.list({
        code: promoCode.toUpperCase(),
        active: true,
        limit: 1,
      });
      if (promoCodes.data.length > 0) {
        discounts = [{ promotion_code: promoCodes.data[0].id }];
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      ...(discounts ? { discounts } : {}),
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: 'Commande Island Dreams',
          footer: 'Merci pour votre commande chez Island Dreams.',
          metadata: {
            source: 'island-dreams-web',
          },
        },
      },
      customer_creation: 'always',
      customer_email: customer.email.trim(),
      phone_number_collection: {
        enabled: true,
      },
      shipping_address_collection: {
        allowed_countries: ['FR', 'RE'],
      },
      locale: 'fr',
      success_url: `${origin}/checkout/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/annule`,
      metadata: {
        source: 'island-dreams-web',
        shippingMethodId: shippingMethodId || '',
        shippingMethodName: selectedShippingName,
        shippingCost: String(selectedShippingCost),
        promoCode: promoCode ? promoCode.toUpperCase() : '',
        customerName: customer.name.trim(),
        customerPhone: customer.phone.trim(),
        shippingLine1: customer.address.line1.trim(),
        shippingLine2: customer.address.line2?.trim() || '',
        shippingCity: customer.address.city.trim(),
        shippingPostalCode: customer.address.postalCode.trim(),
        shippingCountry: customer.address.country || 'RE',
        ...giftMetadata,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('Stripe checkout error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
