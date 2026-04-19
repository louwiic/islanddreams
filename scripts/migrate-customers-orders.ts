#!/usr/bin/env node
/**
 * Migration Clients + Commandes WooCommerce → Supabase
 *
 * Usage :
 *   npm run migrate:clients
 *   npm run migrate:clients -- --dry-run
 */

import { resolve } from 'node:path';
import { config } from 'dotenv';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const WC_URL = process.env.WOOCOMMERCE_URL!;
const WC_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY!;
const WC_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const DRY_RUN = process.argv.includes('--dry-run');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/* ── WooCommerce API ─────────────────────────────────────── */

async function wcFetchAll<T>(endpoint: string): Promise<T[]> {
  const all: T[] = [];
  let page = 1;

  while (true) {
    const url = `${WC_URL}/wp-json/wc/v3/${endpoint}?consumer_key=${WC_KEY}&consumer_secret=${WC_SECRET}&per_page=100&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`WC API ${res.status}: ${endpoint}`);
    const data = (await res.json()) as T[];
    if (data.length === 0) break;
    all.push(...data);
    if (data.length < 100) break;
    page++;
  }

  return all;
}

/* ── Types WC ────────────────────────────────────────────── */

type WcAddress = {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2: string;
  city: string;
  postcode: string;
  country: string;
  state: string;
  phone: string;
  email?: string;
};

type WcCustomer = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  billing: WcAddress;
  shipping: WcAddress;
};

type WcOrderItem = {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  subtotal: string;
  total: string;
  price: number;
};

type WcOrder = {
  id: number;
  number: string;
  status: string;
  total: string;
  currency: string;
  date_created: string;
  customer_id: number;
  billing: WcAddress;
  shipping: WcAddress;
  line_items: WcOrderItem[];
  shipping_total: string;
  payment_method: string;
  payment_method_title: string;
  customer_note: string;
};

/* ── Status mapping ──────────────────────────────────────── */

const STATUS_MAP: Record<string, string> = {
  pending: 'pending',
  processing: 'preparing',
  'on-hold': 'pending',
  completed: 'delivered',
  cancelled: 'cancelled',
  refunded: 'refunded',
  failed: 'cancelled',
};

/* ── Migration ───────────────────────────────────────────── */

async function migrate() {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log(' 👥 Migration Clients + Commandes');
  console.log('═══════════════════════════════════════════');
  if (DRY_RUN) console.log(' MODE DRY-RUN\n');

  // 1. Clients
  console.log('1️⃣  Récupération des clients WooCommerce...');
  const wcCustomers = await wcFetchAll<WcCustomer>('customers');
  console.log(`   → ${wcCustomers.length} client(s)\n`);

  const customerMap = new Map<number, string>(); // wcId → supabaseId
  let clientsCreated = 0;

  for (const wc of wcCustomers) {
    if (!wc.email) continue;

    const billing = wc.billing;
    const firstName = wc.first_name || billing.first_name || '';
    const lastName = wc.last_name || billing.last_name || '';

    console.log(`   👤 ${firstName} ${lastName} <${wc.email}>`);

    if (DRY_RUN) {
      clientsCreated++;
      continue;
    }

    // Upsert par email
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('email', wc.email)
      .single();

    if (existing) {
      customerMap.set(wc.id, existing.id);
      console.log(`      ↻ Existe déjà`);
      continue;
    }

    const addresses = [];
    if (billing.address_1) {
      addresses.push({
        type: 'billing',
        first_name: billing.first_name,
        last_name: billing.last_name,
        line1: billing.address_1,
        line2: billing.address_2,
        city: billing.city,
        postal_code: billing.postcode,
        country: billing.country,
        phone: billing.phone,
      });
    }
    if (wc.shipping.address_1) {
      addresses.push({
        type: 'shipping',
        first_name: wc.shipping.first_name,
        last_name: wc.shipping.last_name,
        line1: wc.shipping.address_1,
        line2: wc.shipping.address_2,
        city: wc.shipping.city,
        postal_code: wc.shipping.postcode,
        country: wc.shipping.country,
        phone: wc.shipping.phone,
      });
    }

    const { data: created, error } = await supabase
      .from('customers')
      .insert({
        email: wc.email,
        first_name: firstName || null,
        last_name: lastName || null,
        phone: billing.phone || wc.shipping.phone || null,
        addresses: addresses.length > 0 ? addresses : [],
      })
      .select('id')
      .single();

    if (error) {
      console.warn(`      ❌ ${error.message}`);
    } else {
      customerMap.set(wc.id, created.id);
      clientsCreated++;
      console.log(`      ✓ Créé`);
    }
  }

  // 2. Commandes
  console.log('\n2️⃣  Récupération des commandes WooCommerce...');
  const wcOrders = await wcFetchAll<WcOrder>('orders');
  console.log(`   → ${wcOrders.length} commande(s)\n`);

  // Charger le mapping produits WC slug → Supabase id
  const { data: allProducts } = await supabase
    .from('products')
    .select('id, slug, name');
  const productsByName = new Map(
    (allProducts ?? []).map((p) => [p.name.toUpperCase(), p.id])
  );

  let ordersCreated = 0;
  let itemsCreated = 0;

  for (const wc of wcOrders) {
    const orderNumber = `WC-${wc.number}`;
    console.log(`   📦 ${orderNumber} — ${wc.total}€ — ${wc.status}`);

    if (DRY_RUN) {
      ordersCreated++;
      itemsCreated += wc.line_items.length;
      continue;
    }

    // Vérifier si déjà importée
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', orderNumber)
      .single();

    if (existing) {
      console.log(`      ↻ Existe déjà`);
      continue;
    }

    // Trouver ou créer le client par email
    let customerId = customerMap.get(wc.customer_id) || null;
    if (!customerId && wc.billing.email) {
      const { data: cust } = await supabase
        .from('customers')
        .select('id')
        .eq('email', wc.billing.email)
        .single();

      if (cust) {
        customerId = cust.id;
      } else {
        const { data: created } = await supabase
          .from('customers')
          .insert({
            email: wc.billing.email,
            first_name: wc.billing.first_name || null,
            last_name: wc.billing.last_name || null,
            phone: wc.billing.phone || null,
          })
          .select('id')
          .single();
        customerId = created?.id || null;
      }
    }

    const shippingAddress = wc.shipping.address_1
      ? {
          name: `${wc.shipping.first_name} ${wc.shipping.last_name}`.trim(),
          line1: wc.shipping.address_1,
          line2: wc.shipping.address_2,
          city: wc.shipping.city,
          postal_code: wc.shipping.postcode,
          country: wc.shipping.country,
        }
      : null;

    const billingAddress = wc.billing.address_1
      ? {
          name: `${wc.billing.first_name} ${wc.billing.last_name}`.trim(),
          line1: wc.billing.address_1,
          line2: wc.billing.address_2,
          city: wc.billing.city,
          postal_code: wc.billing.postcode,
          country: wc.billing.country,
        }
      : null;

    const total = parseFloat(wc.total) || 0;
    const shippingCost = parseFloat(wc.shipping_total) || 0;
    const subtotal = total - shippingCost;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        status: (STATUS_MAP[wc.status] || 'pending') as any,
        subtotal,
        shipping_cost: shippingCost,
        total,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        notes: wc.customer_note || null,
        created_at: new Date(wc.date_created).toISOString(),
      })
      .select('id')
      .single();

    if (orderError) {
      console.warn(`      ❌ ${orderError.message}`);
      continue;
    }

    ordersCreated++;

    // Items
    for (const item of wc.line_items) {
      const productId = productsByName.get(item.name.toUpperCase()) || null;
      const unitPrice = item.quantity > 0 ? parseFloat(item.total) / item.quantity : 0;

      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: productId,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        total: parseFloat(item.total),
      });

      itemsCreated++;
    }

    console.log(`      ✓ Créée (${wc.line_items.length} article(s))`);
  }

  // Rapport
  console.log('\n═══════════════════════════════════════════');
  console.log(' 📊 Rapport');
  console.log('═══════════════════════════════════════════');
  console.log(`   Clients WC        : ${wcCustomers.length}`);
  console.log(`   Clients créés     : ${clientsCreated}`);
  console.log(`   Commandes WC      : ${wcOrders.length}`);
  console.log(`   Commandes créées  : ${ordersCreated}`);
  console.log(`   Articles créés    : ${itemsCreated}`);
  console.log('═══════════════════════════════════════════\n');
}

migrate().catch((err) => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});
