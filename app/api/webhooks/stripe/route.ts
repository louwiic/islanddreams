import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, randomUUID } from 'crypto';
import { getStripeClient } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { orderConfirmation, orderNotificationAdmin } from '@/lib/email/templates';
import type Stripe from 'stripe';
import type { QrConversion } from '@/lib/actions/qr';

type OrderItemInsert = {
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  variant_label: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
};

function formatDateFr(value?: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('fr-FR');
}

function expiryToStripeTimestamp(value?: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T23:59:59.999Z`);
  if (Number.isNaN(date.getTime())) return undefined;
  return Math.floor(date.getTime() / 1000);
}

function generateVoucherCode() {
  return `ID${randomBytes(4).toString('hex').toUpperCase()}`;
}

async function createVoucherPromotionCode(params: {
  amount: number;
  expiresAt?: string | null;
  orderId: string;
  sessionId: string;
  recipientName?: string | null;
  recipientEmail?: string | null;
}) {
  const stripe = getStripeClient();
  const coupon = await stripe.coupons.create({
    amount_off: Math.round(params.amount * 100),
    currency: 'eur',
    duration: 'once',
    name: `Bon d'achat Island Dreams ${params.amount.toFixed(2)} €`,
    metadata: {
      source: 'island-dreams-voucher',
      orderId: params.orderId,
      stripeSessionId: params.sessionId,
      recipientName: params.recipientName || '',
      recipientEmail: params.recipientEmail || '',
    },
  });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateVoucherCode();
    try {
      const promotionCode = await stripe.promotionCodes.create({
        promotion: {
          type: 'coupon',
          coupon: coupon.id,
        },
        code,
        max_redemptions: 1,
        expires_at: expiryToStripeTimestamp(params.expiresAt),
        metadata: {
          source: 'island-dreams-voucher',
          orderId: params.orderId,
          stripeSessionId: params.sessionId,
          amount: params.amount.toFixed(2),
          recipientName: params.recipientName || '',
          recipientEmail: params.recipientEmail || '',
        },
      });
      return promotionCode.code;
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (!message.toLowerCase().includes('code')) throw error;
    }
  }

  throw new Error('Impossible de générer un code bon d’achat unique');
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripeClient().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutCompleted(session);
  }
  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
    if (paymentIntentId) await cancelAffiliateConversion(paymentIntentId);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient();

  // Récupérer les line items
  const lineItems = await getStripeClient().checkout.sessions.listLineItems(session.id, {
    expand: ['data.price.product'],
  });

  // Créer ou trouver le client
  const email = session.customer_details?.email;
  const metadata = session.metadata ?? {};
  const metadataPhone = metadata.customerPhone || null;
  const metadataName = metadata.customerName || null;
  let customerId: string | null = null;

  if (email) {
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      customerId = existing.id;
    } else {
      const { data: created } = await supabase
        .from('customers')
        .insert({
          email,
          first_name: (session.customer_details?.name || metadataName)?.split(' ')[0] || null,
          last_name: (session.customer_details?.name || metadataName)?.split(' ').slice(1).join(' ') || null,
          phone: session.customer_details?.phone || metadataPhone,
        })
        .select('id')
        .single();

      customerId = created?.id || null;
    }
  }

  // Adresse de livraison
  const shippingDetails = (
    session as Stripe.Checkout.Session & {
      shipping_details?: {
        address?: Stripe.Address | null;
        name?: string | null;
      } | null;
    }
  ).shipping_details;
  const shipping = shippingDetails?.address;
  const metadataShipping =
    metadata.shippingLine1 || metadata.shippingCity || metadata.shippingPostalCode
      ? {
          line1: metadata.shippingLine1 || null,
          line2: metadata.shippingLine2 || null,
          city: metadata.shippingCity || null,
          postal_code: metadata.shippingPostalCode || null,
          country: metadata.shippingCountry || null,
          name: metadataName,
          phone: metadataPhone,
        }
      : null;
  const shippingAddress = shipping
    ? {
        line1: shipping.line1,
        line2: shipping.line2,
        city: shipping.city,
        postal_code: shipping.postal_code,
        country: shipping.country,
        name: shippingDetails?.name || metadataName,
        phone: session.customer_details?.phone || metadataPhone,
      }
    : metadataShipping;

  // Calculer le total
  const subtotal = (session.amount_subtotal ?? 0) / 100;
  const metadataShippingCost = Number(metadata.shippingCost || 0);
  const shippingCost = ((session.total_details?.amount_shipping ?? 0) / 100) || metadataShippingCost;
  const total = (session.amount_total ?? 0) / 100;

  if (metadata.recoveryToken) {
    await (supabase as any).from('abandoned_carts').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      next_reminder_at: null,
      updated_at: new Date().toISOString(),
    }).eq('recovery_token', metadata.recoveryToken);
  }

  // Idempotence — ne pas créer deux fois la même commande
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .single();

  if (existing) {
    console.log(`⚠ Commande déjà créée pour session ${session.id}, ignoré`);
    return;
  }

  // Créer la commande
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId,
      status: 'confirmed',
      subtotal,
      shipping_cost: shippingCost,
      total,
      shipping_address: shippingAddress,
      stripe_session_id: session.id,
      stripe_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .select('id')
    .single();

  if (orderError) {
    console.error('Failed to create order:', orderError.message);
    return;
  }

  // Créer les lignes de commande
  const orderItems: OrderItemInsert[] = [];
  for (const li of lineItems.data) {
    const product = li.price?.product as Stripe.Product | undefined;
    const productMetadata = product?.metadata ?? {};
    const voucherAmount = Number(productMetadata.voucherAmount || 0);
    const voucherExpiresAt = productMetadata.voucherExpiresAt || null;
    let productName = li.description || 'Produit';
    let variantLabel = productMetadata.variantLabel || null;

    if (Number.isFinite(voucherAmount) && voucherAmount > 0) {
      const code = await createVoucherPromotionCode({
        amount: voucherAmount,
        expiresAt: voucherExpiresAt,
        orderId: order.id,
        sessionId: session.id,
        recipientName: productMetadata.voucherRecipientName || null,
        recipientEmail: productMetadata.voucherRecipientEmail || null,
      });
      const expiresLabel = formatDateFr(voucherExpiresAt);
      const recipientLabel = productMetadata.voucherRecipientName
        ? ` — pour ${productMetadata.voucherRecipientName}`
        : '';
      productName = `Bon d'achat ${voucherAmount.toFixed(2)} € — code ${code}`;
      variantLabel = [
        `Code : ${code}`,
        expiresLabel ? `Valable jusqu'au ${expiresLabel}` : null,
        productMetadata.voucherIsGift === 'true' ? `À offrir${recipientLabel}` : null,
      ].filter(Boolean).join(' — ');
    }

    orderItems.push({
      order_id: order.id,
      product_id: productMetadata.productId || null,
      variant_id: productMetadata.variantId || null,
      variant_label: variantLabel,
      product_name: productName,
      quantity: li.quantity ?? 1,
      unit_price: (li.price?.unit_amount ?? 0) / 100,
      total: ((li.price?.unit_amount ?? 0) * (li.quantity ?? 1)) / 100,
    });
  }

  if (metadata.giftProductId && metadata.giftProductName) {
    orderItems.push({
      order_id: order.id,
      product_id: metadata.giftProductId,
      variant_id: null,
      variant_label: 'Cadeau offert',
      product_name: `${metadata.giftProductName} — cadeau offert`,
      quantity: 1,
      unit_price: 0,
      total: 0,
    });
  }

  if (orderItems.length > 0) {
    await supabase.from('order_items').insert(orderItems);
  }

  // Mettre à jour le stock
  for (const item of orderItems) {
    if (item.product_id) {
      const { data: prod } = await supabase
        .from('products')
        .select('manage_stock, stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (prod?.manage_stock && prod.stock_quantity !== null) {
        const newStock = Math.max(0, prod.stock_quantity - item.quantity);
        await supabase
          .from('products')
          .update({
            stock_quantity: newStock,
            in_stock: newStock > 0,
          })
          .eq('id', item.product_id);
      }
    }
  }

  console.log(`✓ Commande créée: ${order.id} — ${total}€`);

  if (metadata.affiliateCampaignId && metadata.affiliatePartnerEmail) {
    const commissionRate = Number(metadata.affiliateCommissionRate || 0);
    const commissionBase = Math.max(0, total - shippingCost);
    if (Number.isFinite(commissionRate) && commissionRate > 0) {
      const conversionPayload = {
        campaign_id: metadata.affiliateCampaignId,
        partner_email: metadata.affiliatePartnerEmail.toLowerCase(),
        order_id: order.id,
        stripe_session_id: session.id,
        order_total: total,
        commission_rate: commissionRate,
        commission_amount: Math.round(commissionBase * commissionRate) / 100,
        status: 'pending',
      };
      const { error: conversionInsertError } = await (supabase as any)
        .from('qr_partner_conversions')
        .upsert(conversionPayload, { onConflict: 'stripe_session_id', ignoreDuplicates: true });

      if (!conversionInsertError) {
        console.log(`[QR-AFFILIATION] Conversion enregistrée pour ${session.id}`);
      } else {
        // Compatibilité tant que la migration qr_partner_conversions n'est pas appliquée.
      const { data: conversionsRow } = await supabase
        .from('shop_settings')
        .select('value')
        .eq('key', 'qr_conversions')
        .maybeSingle();
      const conversions = Array.isArray(conversionsRow?.value)
        ? (conversionsRow.value as unknown as QrConversion[])
        : [];
      if (!conversions.some((conversion) => conversion.stripeSessionId === session.id)) {
        const conversion: QrConversion = {
          id: randomUUID(),
          campaignId: metadata.affiliateCampaignId,
          partnerEmail: metadata.affiliatePartnerEmail.toLowerCase(),
          orderId: order.id,
          stripeSessionId: session.id,
          orderTotal: total,
          commissionRate,
          commissionAmount: Math.round(commissionBase * commissionRate) / 100,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        await supabase.from('shop_settings').upsert(
          { key: 'qr_conversions', value: [...conversions, conversion] },
          { onConflict: 'key' },
        );
      }
      }
    }
  }

  // ── Enregistrer l'usage du code promo ───────────────────────────
  const promoCodeUsed = metadata.promoCode;
  console.log(`[PROMO-WEBHOOK] metadata.promoCode="${promoCodeUsed}", email="${email}"`);
  if (promoCodeUsed && email) {
    const { error: promoErr } = await supabase
      .from('promo_usage')
      .insert({
        email: email.toLowerCase(),
        promo_code: promoCodeUsed.toUpperCase(),
        stripe_session_id: session.id,
      });
    if (promoErr) {
      // Doublon = déjà enregistré, pas grave
      if (promoErr.code === '23505') {
        console.log(`[PROMO-WEBHOOK] Déjà enregistré, ignoré`);
      } else {
        console.error('[PROMO-WEBHOOK] Erreur insert:', promoErr.message);
      }
    } else {
      console.log(`[PROMO-WEBHOOK] ✓ Promo ${promoCodeUsed} enregistré pour ${email}`);
    }
  }

  // ── Emails ──────────────────────────────────────────────────────
  const customerName = session.customer_details?.name || metadataName || 'Client';
  const customerEmail = session.customer_details?.email;
  const shippingStr = shippingAddress
    ? `${shippingAddress.line1}${shippingAddress.line2 ? ', ' + shippingAddress.line2 : ''}, ${shippingAddress.postal_code} ${shippingAddress.city}${shippingAddress.phone ? ` — Tél : ${shippingAddress.phone}` : ''}`
    : undefined;

  const emailOrderData = {
    orderNumber: order.id.slice(0, 8).toUpperCase(),
    customerName,
    items: orderItems.map((i) => ({
      name: i.product_name,
      quantity: i.quantity,
      price: i.unit_price,
    })),
    total,
    shippingAddress: shippingStr,
  };

  // Email confirmation au client
  if (customerEmail) {
    const tpl = orderConfirmation(emailOrderData);
    await sendEmail({ to: customerEmail, ...tpl });
  }

  // Notification à l'admin (configurable via ADMIN_EMAIL)
  const adminEmail = process.env.ADMIN_EMAIL || 'contact@islanddreams.re';
  const adminTpl = orderNotificationAdmin(emailOrderData);
  await sendEmail({ to: adminEmail, ...adminTpl });
}

async function cancelAffiliateConversion(paymentIntentId: string) {
  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent', paymentIntentId)
    .maybeSingle();
  if (!order) return;

  const { data: row } = await supabase
    .from('shop_settings')
    .select('value')
    .eq('key', 'qr_conversions')
    .maybeSingle();
  const conversions = Array.isArray(row?.value) ? (row.value as unknown as QrConversion[]) : [];
  const next = conversions.map((conversion) =>
    conversion.orderId === order.id && conversion.status !== 'paid'
      ? { ...conversion, status: 'cancelled' as const }
      : conversion,
  );
  await supabase.from('shop_settings').upsert(
    { key: 'qr_conversions', value: next },
    { onConflict: 'key' },
  );
}
