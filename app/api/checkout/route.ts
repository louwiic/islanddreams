import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateShipping } from '@/lib/actions/shipping';
import type { CartItem } from '@/lib/cart/types';
import type { QrCampaign } from '@/lib/actions/qr';

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

function isVoucherItem(item: CartItem) {
  return ['bon-d-achat', 'bon-achat', 'carte-cadeau'].includes(item.slug) || Boolean(item.voucher);
}

function getVoucherAmount(item: CartItem) {
  const amount = Number(item.voucher?.amount ?? item.price);
  if (!Number.isFinite(amount)) return null;
  return Math.round(amount * 100) / 100;
}

function isValidVoucherExpiry(value?: string) {
  if (!value) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const expiry = new Date(`${value}T23:59:59.999Z`).getTime();
  return Number.isFinite(expiry) && expiry >= Date.now();
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

    const attributionCampaignId = req.cookies.get('islanddreams_qr_attribution')?.value || '';
    let affiliateMetadata = {
      affiliateCampaignId: '',
      affiliatePartnerEmail: '',
      affiliateCommissionRate: '',
    };
    if (attributionCampaignId) {
      const { data: qrSettings } = await supabase
        .from('shop_settings')
        .select('value')
        .eq('key', 'qr_campaigns')
        .maybeSingle();
      const campaigns = Array.isArray(qrSettings?.value) ? (qrSettings.value as unknown as QrCampaign[]) : [];
      const campaign = campaigns.find((item) => item.id === attributionCampaignId);
      if (campaign?.isActive && campaign.partnerEnabled && campaign.partnerEmail && (campaign.commissionRate ?? 0) > 0) {
        affiliateMetadata = {
          affiliateCampaignId: campaign.id,
          affiliatePartnerEmail: campaign.partnerEmail.toLowerCase(),
          affiliateCommissionRate: String(campaign.commissionRate),
        };
      }
    }

    // ── Valider les prix et le stock depuis la BDD ──────────────────────
    const productIds = items.map((i) => i.productId);
    const { data: dbProducts, error: dbError } = await supabase
      .from('products')
      .select('id, name, price, sale_price, manage_stock, stock_quantity, in_stock, weight_grams')
      .in('id', productIds);

    if (dbError || !dbProducts) {
      return NextResponse.json({ error: 'Impossible de vérifier les produits' }, { status: 500 });
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    const validatedSubtotal = items.reduce((sum, item) => {
      const dbProd = productMap.get(item.productId);
      const unitPrice = isVoucherItem(item)
        ? (getVoucherAmount(item) ?? 0)
        : dbProd ? dbProd.sale_price ?? dbProd.price : 0;
      return sum + unitPrice * item.quantity;
    }, 0);
    const validatedWeightG = items.reduce((sum, item) => {
      const dbProd = productMap.get(item.productId);
      return sum + (dbProd?.weight_grams ?? 0) * item.quantity;
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

      if (isVoucherItem(item)) {
        const voucherAmount = getVoucherAmount(item);
        if (!voucherAmount || voucherAmount < 10 || voucherAmount > 500) {
          return NextResponse.json(
            { error: 'Le montant du bon d’achat doit être compris entre 10 € et 500 €' },
            { status: 400 },
          );
        }
        if (item.quantity !== 1) {
          return NextResponse.json(
            { error: 'Un bon d’achat doit être ajouté au panier à l’unité' },
            { status: 400 },
          );
        }
        if (!isValidVoucherExpiry(item.voucher?.expiresAt)) {
          return NextResponse.json(
            { error: 'La date limite du bon d’achat est invalide ou déjà passée' },
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
      const voucherAmount = isVoucherItem(item) ? getVoucherAmount(item) : null;
      const unitPrice = voucherAmount ?? dbProd.sale_price ?? dbProd.price;
      const voucher = item.voucher;

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
              voucherAmount: voucherAmount ? String(voucherAmount) : '',
              voucherIsGift: voucher?.isGift ? 'true' : 'false',
              voucherExpiresAt: voucher?.expiresAt || '',
              voucherRecipientName: voucher?.recipientName || '',
              voucherRecipientEmail: voucher?.recipientEmail || '',
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
      const availableShipping = await calculateShipping(
        customer.address.country || 'RE',
        customer.address.postalCode.trim(),
        validatedWeightG
      );
      const method = availableShipping
        ?.flatMap((option) => option.methods)
        .find((option) => option.id === shippingMethodId);

      if (!method) {
        return NextResponse.json(
          { error: 'Mode de livraison indisponible pour cette adresse ou ce poids' },
          { status: 400 }
        );
      }

      selectedShippingCost = method.cost;
      selectedShippingName = method.name;

      if (method.cost > 0) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Livraison — ${method.name}`,
              metadata: {
                productId: '',
                variantId: '',
                variantLabel: '',
                voucherAmount: '',
                voucherIsGift: 'false',
                voucherExpiresAt: '',
                voucherRecipientName: '',
                voucherRecipientEmail: '',
              },
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
        const promotion = promoCodes.data[0];
        const validFrom = promotion.metadata?.validFrom ? new Date(promotion.metadata.validFrom) : null;
        if (validFrom && !Number.isNaN(validFrom.getTime()) && validFrom.getTime() > Date.now()) {
          return NextResponse.json({ error: 'Ce code promo n’est pas encore actif.' }, { status: 400 });
        }
        discounts = [{ promotion_code: promotion.id }];
      } else {
        return NextResponse.json({ error: 'Code promo invalide ou expiré.' }, { status: 400 });
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
        ...affiliateMetadata,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('Stripe checkout error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
