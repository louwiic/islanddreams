import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
import { compileQuery, sqlLiteral } from '../../lib/pgbase/query';
import { mediaUrl, restoreSourceMedia } from '../../lib/pgbase/media';

const headers = new Headers();
const request = (suffix: string) => new URL('http://example.invalid/rest/v1/' + suffix);
assert.throws(() => compileQuery(request('users?select=*'), 'GET', headers), /Table inconnue/);
assert.throws(() => compileQuery(request('products?select=password_hash'), 'GET', headers), /Colonne inconnue/);
assert.throws(() => compileQuery(request('products?select=id&order=id;DROP+TABLE+products'), 'GET', headers), /Colonne inconnue/);
assert.throws(() => compileQuery(request('products?select=id&offset=-1'), 'GET', headers), /Pagination invalide/);
assert.throws(() => compileQuery(request('products?select=id&price=unknown.1'), 'GET', headers), /Opérateur/);
assert.throws(() => sqlLiteral('a\0b'), /invalide/);
assert.equal(sqlLiteral("a'\\b"), "E'a''\\\\b'");
const original = 'https://sgxilglkeupxpnzkzqfq.supabase.co/storage/v1/object/public/product-images/test/a.webp';
assert.equal(restoreSourceMedia(mediaUrl(original)), original);
assert.equal(restoreSourceMedia('https://www.islanddreams.re' + mediaUrl(original)), original);
console.log('Query validation and media round-trip checks passed');

async function integration() {
const dsn = process.env.PGBASE_TEST_DSN;
if (!dsn) {
  console.log('Set PGBASE_TEST_DSN to test against a disposable local PostgreSQL copy');
} else {
  const parsed = new URL(dsn);
  assert.ok(['127.0.0.1', 'localhost'].includes(parsed.hostname));
  assert.equal(parsed.pathname, '/islanddreams_adapter');
  function sql(statement: string) {
    try {
      return execFileSync('psql', [dsn!, '-XAtq', '-v', 'ON_ERROR_STOP=1'], { input: 'BEGIN; SET LOCAL search_path TO app,public; ' + statement + '; ROLLBACK;', encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    } catch { throw new Error('Local SQL integration check failed (private row contents suppressed)'); }
  }
  function client(role: 'anon' | 'authenticated' | 'service_role', claims: Record<string, unknown> = {}) {
    return createClient('http://example.invalid', 'test-only', { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: async (input, options) => {
      const req = new Request(input, options);
      const text = ['GET', 'HEAD'].includes(req.method) ? '' : await req.text();
      const query = compileQuery(new URL(req.url), req.method, req.headers, text ? JSON.parse(text) : undefined);
      const raw = sql(`SELECT app.islanddreams_query(${sqlLiteral(query.sql)},${sqlLiteral({ role, ...claims })}::jsonb,${sqlLiteral(role)})`);
      const result = JSON.parse(raw);
      const responseHeaders = new Headers({ 'Content-Type': 'application/json' });
      if (query.count) responseHeaders.set('Content-Range', `${result.rows.length ? '0-' + (result.rows.length - 1) : '*'}/${result.count}`);
      if (query.head) return new Response(null, { headers: responseHeaders });
      if (!query.returnRows) return new Response(null, { status: 204 });
      if (query.single && result.rows.length !== 1) return Response.json({ code: 'PGRST116', details: `The result contains ${result.rows.length} rows`, message: 'One row required' }, { status: 406 });
      return new Response(JSON.stringify(query.single ? result.rows[0] : result.rows), { headers: responseHeaders });
    } } });
  }
  const admin = client('service_role');
  const anon = client('anon');
  const published = await anon.from('products').select('id,name,price,status').eq('status', 'publish').order('sort_order');
  assert.equal(published.error, null);
  assert.equal(published.data?.length, 44);
  assert.equal(typeof published.data?.[0].price, 'number');
  const privateRows = await anon.from('products').select('id').eq('status', 'private');
  assert.equal(privateRows.data?.length, 0);
  const allRows = await admin.from('products').select('id');
  assert.equal(allRows.data?.length, 45);
  const count = await admin.from('products').select('*', { count: 'exact', head: true });
  assert.equal(count.count, 45);
  const nested = await admin.from('orders').select('id,customers(email,first_name,last_name)').limit(2);
  assert.equal(nested.error, null);
  assert.equal(nested.data?.length, 2);
  assert.ok(nested.data?.every(r => !Array.isArray(r.customers)));
  const productNested = await admin.from('textile_highlights').select('id,product:product_id(name,slug,product_images(id,url,is_main))');
  assert.equal(productNested.error, null);
  const filtered = await admin.from('orders').select('id,status').not('status', 'in', '("cancelled","refunded")');
  assert.equal(filtered.error, null);
  assert.ok(filtered.data?.every(r => !['cancelled', 'refunded'].includes(r.status)));
  const injection = await admin.from('products').select('id').eq('name', "x'; DELETE FROM app.products; --");
  assert.equal(injection.error, null);
  assert.equal(injection.data?.length, 0);
  const missing = await admin.from('products').select('id').eq('slug', 'does-not-exist-integration-check').maybeSingle();
  assert.equal(missing.error, null);
  assert.equal(missing.data, null);
  const inserted = await admin.from('newsletter_subscribers').insert({ email: 'pgbase-integration@example.invalid' }).select('id,email').single();
  assert.equal(inserted.error, null);
  assert.equal(typeof inserted.data?.id, 'string');
  const upserted = await admin.from('shop_settings').upsert({ key: 'pgbase-integration-test', value: { enabled: true } }, { onConflict: 'key' }).select('key,value').single();
  assert.equal(upserted.error, null);
  assert.equal(upserted.data?.value.enabled, true);
  const anonymousCustomers = await anon.from('customers').select('id');
  assert.equal(anonymousCustomers.data?.length, 0);
  const owner = sql("SELECT auth_user_id FROM app.customers WHERE auth_user_id IS NOT NULL LIMIT 1");
  if (owner) {
    const customer = client('authenticated', { sub: owner });
    const ownCustomers = await customer.from('customers').select('id,auth_user_id');
    assert.ok(ownCustomers.data?.length);
    assert.ok(ownCustomers.data?.every(r => r.auth_user_id === owner));
    const ownOrders = await customer.from('orders').select('id,customer_id');
    assert.ok(ownOrders.data?.every(r => ownCustomers.data?.some(c => c.id === r.customer_id)));
  }
  assert.throws(() => sql('SET LOCAL ROLE islanddreams_stage_anon; SELECT app.islanddreams_query(\'SELECT 1\',\'{}\',\'service_role\')'));
  console.log('PostgreSQL integration checks passed: 44 published products, joins, money, counts, writes, injection protection and customer RLS');
}
}
void integration().catch(error => { console.error(error.message); process.exitCode = 1; });
