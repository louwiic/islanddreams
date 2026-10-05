// Test the real Server Actions with an in-memory database; never touches live settings.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function harness() {
  const state = { offered: undefined, authorized: true, writeError: false, readError: false, writes: 0, invalidated: [] };
  const methods = [
    { id: 'postal', zone_id: 'reunion', name: 'La Poste', cost: 6.5, min_weight_g: 1, max_weight_g: 999 },
    { id: 'local', zone_id: 'reunion', name: 'Livraison locale', cost: 12, min_weight_g: null, max_weight_g: null },
  ];
  const rows = {
    shipping_zones: [{ id: 'reunion', name: 'Réunion', enabled: true }],
    shipping_zone_postcodes: [{ zone_id: 'reunion', country: 'RE', postcode_pattern: '974*' }],
    shipping_methods: methods.map(m => ({ ...m, enabled: true })),
  };
  const database = {
    from(table) {
      let filters = [];
      const query = {
        select() { return query; },
        eq(key, value) { filters.push(row => row[key] === value); return query; },
        in(key, values) { filters.push(row => values.includes(row[key])); return query; },
        order() { return query; },
        async maybeSingle() {
          assert.equal(table, 'shop_settings');
          return { data: state.offered === undefined ? null : { value: state.offered }, error: state.readError ? { message: 'offline' } : null };
        },
        async upsert(row) {
          assert.equal(table, 'shop_settings');
          assert.equal(row.key, 'shipping_offered');
          if (state.writeError) return { error: { message: 'offline' } };
          state.offered = row.value;
          state.writes++;
          return { error: null };
        },
        then(resolve, reject) {
          return Promise.resolve({ data: rows[table].filter(row => filters.every(filter => filter(row))), error: null }).then(resolve, reject);
        },
      };
      return query;
    },
  };
  const dependencies = {
    'next/cache': { revalidatePath: p => state.invalidated.push(p) },
    '@/lib/supabase/admin': { createAdminClient: () => database },
    '@/lib/supabase/server': { createClient: async () => database },
    '@/lib/auth/admin': { requireAdmin: async () => { if (!state.authorized) throw new Error('Unauthorized'); } },
  };
  const source = fs.readFileSync(path.join(__dirname, '../lib/actions/shipping.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require: name => {
    assert.ok(dependencies[name], `Unexpected import ${name}`);
    return dependencies[name];
  } });
  return { actions: exports, state, methods };
}

test('default tariffs, free delivery, then exact restoration without changing prices', async () => {
  const { actions, state, methods } = harness();
  assert.equal(await actions.getFreeShipping(), false);
  assert.equal((await actions.calculateShipping('RE', '97436', 500))[0].methods[0].cost, 6.5);
  assert.equal((await actions.calculateShipping('RE', '97436', 1500))[0].methods[0].cost, 12);
  await actions.setFreeShipping(true);
  assert.equal(await actions.getFreeShipping(), true);
  assert.equal((await actions.calculateShipping('RE', '97436', 500))[0].methods[0].cost, 0);
  assert.equal((await actions.calculateShipping('RE', '97436', 1500))[0].methods[0].cost, 0);
  assert.deepEqual(methods.map(m => m.cost), [6.5, 12]);
  await actions.setFreeShipping(false);
  assert.equal((await actions.calculateShipping('RE', '97436', 500))[0].methods[0].cost, 6.5);
  assert.equal((await actions.calculateShipping('RE', '97436', 1500))[0].methods[0].cost, 12);
  assert.ok(state.invalidated.includes('/admin/livraison'));
});

test('free delivery does not unlock unsupported addresses or weight ranges', async () => {
  const { actions } = harness();
  await actions.setFreeShipping(true);
  assert.equal(await actions.calculateShipping('FR', '75001', 500), null);
  assert.equal(await actions.calculateShipping('RE', '99999', 500), null);
  assert.equal((await actions.calculateShipping('RE', '97436', 500))[0].methods.length, 1);
});

test('only an administrator can change the setting', async () => {
  const { actions, state } = harness();
  state.authorized = false;
  await assert.rejects(actions.setFreeShipping(true), /Unauthorized/);
  assert.equal(state.writes, 0);
});

test('invalid input and failed saves do not report success or change the setting', async () => {
  const { actions, state } = harness();
  assert.ok((await actions.setFreeShipping('true')).error);
  state.writeError = true;
  assert.ok((await actions.setFreeShipping(true)).error);
  assert.equal(state.writes, 0);
  assert.equal(await actions.getFreeShipping(), false);
  assert.equal(state.invalidated.length, 0);
});

test('a settings read failure cannot silently charge customers during a free-delivery offer', async () => {
  const { actions, state } = harness();
  state.offered = true;
  state.readError = true;
  await assert.rejects(actions.calculateShipping('RE', '97436', 500), /Impossible de lire/);
});
