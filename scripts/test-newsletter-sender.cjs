const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function sender(responses, audience = '') {
  const calls = [];
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync('lib/newsletter/sender.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, {
    exports, AbortSignal,
    process: { env: { RESEND_API_KEY: 'mock-never-used', RESEND_AUDIENCE_ID: audience } },
    require: id => {
      if (id === 'server-only') return {};
      if (id === 'node:timers/promises') return { setTimeout: async () => {} };
      if (id === '@/lib/email/templates' || id === './token') return {};
      throw Error(id);
    },
    fetch: async (url, options) => {
      calls.push({ url, options });
      const response = responses.shift();
      assert.ok(response, 'Unexpected provider call');
      if (response instanceof Error) throw response;
      return Response.json(response.body || {}, { status: response.status || 200 });
    },
  });
  return { send: exports.sendScheduledMessage, calls };
}
const message = { to: ['subscriber@example.invalid'], subject: 'Fixture', html: '<p>Fixture</p>' };
test('global and legacy audience opt-outs prevent sending', async () => {
  for (const responses of [
    [{ body: { unsubscribed: true } }],
    [{ body: { unsubscribed: false } }, { body: { unsubscribed: true } }],
  ]) {
    const h = sender(responses, 'fixture-audience');
    assert.equal((await h.send(message, 'stable-key')).skipped, true);
    assert.ok(h.calls.every(call => !call.options.method));
  }
});
test('contact lookup outages, permission failures and malformed data never send', async () => {
  for (const response of [{ status: 429 }, { status: 403 }, { body: {} }, new Error('offline')]) {
    const h = sender([response]);
    assert.equal((await h.send(message, 'stable-key')).ok, false);
    assert.equal(h.calls.length, 1);
  }
});
test('consenting or DB-only subscribers use immutable payload and idempotency key', async () => {
  for (const contact of [{ status: 404 }, { body: { unsubscribed: false } }]) {
    const h = sender([contact, { body: { id: 'mock-id' } }]);
    assert.equal((await h.send(message, 'stable-key')).id, 'mock-id');
    const sent = h.calls[1];
    assert.equal(sent.url, 'https://api.resend.com/emails');
    assert.equal(sent.options.headers['Idempotency-Key'], 'stable-key');
    assert.equal(sent.options.body, JSON.stringify(message));
  }
});
test('temporary provider send errors remain retryable', async () => {
  const h = sender([{ body: { unsubscribed: false } }, { status: 429 }]);
  assert.equal((await h.send(message, 'stable-key')).retry, true);
});
