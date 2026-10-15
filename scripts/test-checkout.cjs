// Exercise the real checkout handler with a fake Stripe gateway: never charges a card.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest } = require('next/server');
const root = path.resolve(__dirname, '..');

function harness({ live = false } = {}) {
  const state = { payload: null, sessions: 0 };
  const product = { id: '00000000-0000-4000-8000-000000000001', name: 'Fixture', slug: 'fixture', price: 12, sale_price: null, manage_stock: true, stock_quantity: 5, in_stock: true, weight_grams: 100 };
  const tables = { products: [product], product_variants: [], shop_settings: [] };
  const database = { from(table) {
    let filters = [];
    const query = {
      select() { return query; },
      eq(key, value) { filters.push(row => row[key] === value); return query; },
      in(key, values) { filters.push(row => values.includes(row[key])); return query; },
      maybeSingle() { return Promise.resolve({ data: (tables[table] || []).filter(r => filters.every(f => f(r)))[0] || null, error: null }); },
      then(resolve, reject) { return Promise.resolve({ data: (tables[table] || []).filter(r => filters.every(f => f(r))), error: null }).then(resolve, reject); },
    };
    return query;
  } };
  const stripe = {
    taxRates: { list: async () => ({ data: [] }), create: async () => ({ id: 'txr_fixture' }) },
    promotionCodes: { list: async () => ({ data: [] }) },
    checkout: { sessions: { create: async payload => {
      for (const item of payload.line_items) for (const image of item.price_data.product_data.images || []) {
        assert.match(new URL(image).protocol, /^https?:$/);
        assert.ok(!image.includes('.supabase.co/'), 'Migrated and legacy carts must use restored media');
      }
      state.payload = payload; state.sessions++;
      return { url: 'https://checkout.stripe.test/fixture' };
    } } },
  };
  const dependencies = {
    'server-only': {},
    '@/lib/stripe/client': { getStripeClient: () => stripe },
    '@/lib/supabase/admin': { createAdminClient: () => database },
    '@/lib/actions/shipping': { calculateShipping: async () => [{ zone: 'Fixture', methods: [{ id: 'fixture-shipping', name: 'Shipping', cost: 5 }] }] },
  };
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    const source = fs.readFileSync(file, 'utf8') + (file.endsWith('CartProvider.tsx') ? '\nexport { reducer as testCartReducer };' : '');
    const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, resolveJsonModule: true } });
    vm.runInNewContext(outputText, { exports, process, console, URL, URLSearchParams, Request, Response, Headers, AbortSignal, Buffer, fetch, require: name => {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      if (name.startsWith('@/') || name.startsWith('.')) {
        const base = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name);
        if (base.endsWith('.json')) return JSON.parse(fs.readFileSync(base, 'utf8'));
        return load(base.endsWith('.ts') ? base : base + '.ts');
      }
      return require(name);
    } }, { filename: file });
    return exports;
  }
  if (live) {
    delete dependencies['@/lib/supabase/admin'];
    const { createDataClient } = load(path.join(root, 'lib/pgbase/data-client.ts'));
    dependencies['@/lib/supabase/server'] = { createClient: async () => createDataClient({ role: 'anon', claims: { role: 'anon' } }) };
    dependencies['@/lib/auth/admin'] = { requireAdmin: async () => { throw new Error('No mutations allowed during live checkout audit'); } };
    delete dependencies['@/lib/actions/shipping'];
  }
  const route = load(path.join(root, 'app/api/checkout/route.ts'));
  const body = image => ({ items: [{ productId: product.id, slug: product.slug, name: product.name, price: 0.01, quantity: 1, image }], shippingMethodId: 'fixture-shipping', customer: { name: 'Verification Fixture', email: 'checkout-verification@example.invalid', phone: '0000000000', address: { line1: 'Fixture', city: 'Saint-Denis', postalCode: '97400', country: 'RE' } } });
  const request = input => route.POST(new NextRequest('https://www.islanddreams.re/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json', origin: 'https://www.islanddreams.re' }, body: JSON.stringify(input) }));
  return { request, body, product, state, load };
}

for (const image of ['/media/supabase/product-images/fixture/0.jpg', 'https://sgxilglkeupxpnzkzqfq.supabase.co/storage/v1/object/public/product-images/fixture/0.jpg']) {
  test('checkout creates a valid payment payload for ' + (image.startsWith('/') ? 'migrated media' : 'a cart saved before migration'), async () => {
    const h = harness(); const res = await h.request(h.body(image));
    assert.equal(res.status, 200); assert.equal(h.state.sessions, 1);
    const first = h.state.payload.line_items[0].price_data;
    assert.equal(first.product_data.images[0], 'https://www.islanddreams.re/media/supabase/product-images/fixture/0.jpg');
    assert.equal(first.unit_amount, 1200, 'The database price must override the browser price');
    assert.equal(h.state.payload.line_items.at(-1).price_data.unit_amount, 500);
  });
}
test('invalid optional image does not prevent checkout', async () => {
  const h = harness(); const res = await h.request(h.body('data:image/png;base64,fixture'));
  assert.equal(res.status, 200); assert.equal(h.state.payload.line_items[0].price_data.product_data.images, undefined);
});
test('insufficient stock prevents creating a Stripe session', async () => {
  const h = harness(); const b = h.body(); b.items[0].quantity = 6;
  assert.equal((await h.request(b)).status, 400); assert.equal(h.state.sessions, 0);
});
test('a cart saved before migration keeps its items and quantities and uses restored images', () => {
  const h = harness();
  const { testCartReducer } = h.load(path.join(root, 'lib/cart/CartProvider.tsx'));
  const before = h.body('https://sgxilglkeupxpnzkzqfq.supabase.co/storage/v1/object/public/product-images/fixture/0.jpg').items;
  const cart = testCartReducer({ items: [], total: 0, count: 0 }, { type: 'HYDRATE', items: before });
  assert.equal(cart.items[0].productId, before[0].productId);
  assert.equal(cart.count, 1);
  assert.equal(cart.total, before[0].price);
  assert.equal(cart.items[0].image, '/media/supabase/product-images/fixture/0.jpg');
});

if (process.env.PGBASE_CHECK_LIVE === '1') {
  require('dotenv').config({ path: path.join(root, '.env.local'), quiet: true });
  test('live PGBase catalog, variants, shipping, taxes and checkout payload with fake Stripe only', async () => {
    const h = harness({ live: true });
    const admin = h.load(path.join(root, 'lib/supabase/admin.ts')).createAdminClient();
    const result = await admin.from('products').select('id,name,slug,price,weight_grams,manage_stock,stock_quantity').eq('status', 'publish').eq('in_stock', true);
    assert.equal(result.error, null);
    let selected;
    for (const p of result.data) {
      if (['bon-d-achat', 'bon-achat', 'carte-cadeau'].includes(p.slug) || (p.manage_stock && p.stock_quantity < 1)) continue;
      const v = await admin.from('product_variants').select('id').eq('product_id', p.id);
      assert.equal(v.error, null); if (!v.data.length) { selected = p; break; }
    }
    assert.ok(selected);
    const shipping = await h.load(path.join(root, 'lib/actions/shipping.ts')).calculateShipping('RE', '97400', selected.weight_grams || 0);
    const method = shipping?.flatMap(s => s.methods)[0]; assert.ok(method);
    const b = h.body('/media/supabase/product-images/fixture/0.jpg');
    b.items[0] = { ...b.items[0], productId: selected.id, slug: selected.slug, name: selected.name };
    b.shippingMethodId = method.id;
    const response = await h.request(b); assert.equal(response.status, 200);
    assert.equal(h.state.sessions, 1); assert.ok(h.state.payload.line_items[0].price_data.unit_amount > 0);
    console.log('Live checkout data checks passed; Stripe requests mocked, no payment, customer record, order or email created');
  });
}
