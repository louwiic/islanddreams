import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { orderConfirmation, orderNotificationAdmin } from '@/lib/email/templates';
import type Stripe from 'stripe';

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
          first_name: session.customer_details?.name?.split(' ')[0] || null,
          last_name: session.customer_details?.name?.split(' ').slice(1).join(' ') || null,
          phone: session.customer_details?.phone || null,
        })
        .select('id')
        .single();

      customerId = created?.id || null;
    }
  }

  // Adresse de livraison
  const sessionDetails = session as any;
  const shipping = sessionDetails.shipping_details?.address;
  const shippingAddress = shipping
    ? {
        line1: shipping.line1,
        line2: shipping.line2,
        city: shipping.city,
        postal_code: shipping.postal_code,
        country: shipping.country,
        name: sessionDetails.shipping_details?.name,
      }
    : null;

  // Calculer le total
  const subtotal = (session.amount_subtotal ?? 0) / 100;
  const shippingCost = (session.total_details?.amount_shipping ?? 0) / 100;
  const total = (session.amount_total ?? 0) / 100;

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
    })
    .select('id')
    .single();

  if (orderError) {
    console.error('Failed to create order:', orderError.message);
    return;
  }

  // Créer les lignes de commande
  const orderItems = lineItems.data.map((li) => {
    const product = li.price?.product as Stripe.Product | undefined;
    return {
      order_id: order.id,
      product_id: product?.metadata?.productId || null,
      variant_id: product?.metadata?.variantId || null,
      variant_label: product?.metadata?.variantLabel || null,
      product_name: li.description || 'Produit',
      quantity: li.quantity ?? 1,
      unit_price: (li.price?.unit_amount ?? 0) / 100,
      total: ((li.price?.unit_amount ?? 0) * (li.quantity ?? 1)) / 100,
    };
  });

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

  // ── Emails ──────────────────────────────────────────────────────
  const customerName = session.customer_details?.name || 'Client';
  const customerEmail = session.customer_details?.email;
  const shippingStr = shipping
    ? `${shipping.line1}${shipping.line2 ? ', ' + shipping.line2 : ''}, ${shipping.postal_code} ${shipping.city}`
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

  // Notification à l'admin
  const adminTpl = orderNotificationAdmin(emailOrderData);
  await sendEmail({ to: 'contact@islanddreams.re', ...adminTpl });
}
