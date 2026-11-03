const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, { allowed = false, enabled = false, secret = 'local-test-only-worker-secret-1234567890' } = {}) {
  const exports = {};
  const calls = [];
  const source = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(source, {
    exports, Buffer, Response, console: { error() {} },
    process: { env: { NEWSLETTER_WORKER_SECRET: secret, NEWSLETTER_AUTOMATION_ENABLED: String(enabled), RESEND_API_KEY: 'test-not-used' } },
    require: id => {
      if (id === 'next/server') return { NextResponse: { json: (value, init) => Response.json(value, init) } };
      if (id === 'node:crypto' || id === 'node:timers/promises') return require(id);
      if (id === '@/lib/auth/admin') return { requireAdmin: async () => { if (!allowed) throw Error('denied'); } };
      if (id === '@/lib/newsletter/queue') return {
        queueCommand: async () => { calls.push('db'); return { jobs: [], worker: null }; },
        scheduleCampaign: async () => { calls.push('enqueue'); return { id: 'fixture' }; },
      };
      if (id === '@/lib/newsletter/processor') return { processNewsletterTick: async (_, dryRun) => { calls.push({ dryRun }); return { dryRun }; } };
      if (id === '@/lib/newsletter/sender') return { scheduledMessage() { throw Error('Must not send'); }, sendScheduledMessage() { throw Error('Must not send'); } };
      throw Error(id);
    },
  });
  return { ...exports, calls, secret };
}
const request = (method, body, secret) => new Request('https://example.invalid/api', {
  method, headers: { 'Content-Type': 'application/json', ...(secret ? { Authorization: `Bearer ${secret}` } : {}) },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});
test('unauthenticated users cannot list, schedule or cancel', async () => {
  const h = load('app/api/admin/newsletter/schedules/route.ts');
  for (const method of ['GET', 'POST', 'DELETE']) assert.equal((await h[method](request(method, method === 'GET' ? undefined : {}))).status, 403);
  assert.deepEqual(h.calls, []);
});
test('worker rejects missing configuration and incorrect credentials before database access', async () => {
  const missing = load('app/api/internal/newsletter/tick/route.ts', { secret: '' });
  assert.equal((await missing.POST(request('POST', {}))).status, 503);
  assert.deepEqual(missing.calls, []);
  const h = load('app/api/internal/newsletter/tick/route.ts');
  assert.equal((await h.POST(request('POST', { dryRun: false }, 'wrong'))).status, 401);
  assert.deepEqual(h.calls, []);
});
test('disabled automation and omitted/non-boolean flags always remain dry runs', async () => {
  for (const [enabled, body] of [[false, { dryRun: false }], [true, {}], [true, { dryRun: 'false' }]]) {
    const h = load('app/api/internal/newsletter/tick/route.ts', { enabled });
    const response = await h.POST(request('POST', body, h.secret));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).dryRun, true);
  }
});
test('sending requires valid worker credentials, explicit false and enabled server flag', async () => {
  const h = load('app/api/internal/newsletter/tick/route.ts', { enabled: true });
  const response = await h.POST(request('POST', { dryRun: false }, h.secret));
  assert.equal((await response.json()).dryRun, false);
});
