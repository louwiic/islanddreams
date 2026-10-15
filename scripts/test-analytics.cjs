const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function harness({ consent = 'accepted', href = 'https://www.islanddreams.re/boutique?email=secret@example.com#private', blocked = false, enabled = true } = {}) {
  const requests = [];
  const exports = {};
  const { outputText } = ts.transpileModule(fs.readFileSync('lib/analytics/plausible.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  vm.runInNewContext(outputText, {
    exports, URL, window: { location: { href } },
    document: { referrer: 'https://google.com/search?q=private@example.com' },
    navigator: { globalPrivacyControl: blocked },
    localStorage: { getItem: key => key === 'islanddreams_cookie_consent' ? consent : null },
    process: { env: { NEXT_PUBLIC_PLAUSIBLE_URL: enabled ? 'https://stats.example.com/' : '' } },
    fetch: (...args) => { requests.push(args); return Promise.resolve({ ok: true }); },
  });
  return { ...exports, requests };
}

test('strips personal queries, fragments and arbitrary event properties before sending', () => {
  const h = harness();
  assert.equal(h.track('checkout_started', { email: 'private@example.com', session_id: 'cs_live_secret' }), true);
  const [endpoint, options] = h.requests[0];
  assert.equal(endpoint, 'https://stats.example.com/api/event');
  assert.deepEqual(JSON.parse(options.body), { name: 'checkout_started', domain: 'islanddreams.re', url: 'https://islanddreams.re/boutique', referrer: 'https://google.com' });
  assert.equal(options.referrerPolicy, 'no-referrer');
  assert.equal(options.credentials, 'omit');
});

test('refused or missing consent, GPC and an unconfigured endpoint send nothing', () => {
  for (const options of [{ consent: null }, { consent: 'rejected' }, { blocked: true }, { enabled: false }]) {
    const h = harness(options);
    assert.equal(h.track('pageview'), false);
    assert.equal(h.requests.length, 0);
  }
});

test('private pages and preview/local hosts are never measured', () => {
  for (const href of ['https://islanddreams.re/admin/commandes/123', 'https://islanddreams.re/compte', 'https://islanddreams.re/auth/callback?token=secret', 'https://islanddreams.re/newsletter/desinscription?token=secret', 'https://islanddreams.re/partenaire', 'http://localhost:3000/', 'https://preview.vercel.app/']) {
    const h = harness({ href });
    assert.equal(h.track('pageview'), false, href);
    assert.equal(h.requests.length, 0);
  }
});

test('Stripe return page never transmits the payment session ID', () => {
  const h = harness({ href: 'https://islanddreams.re/checkout/succes?session_id=cs_live_secret' });
  h.track('pageview');
  assert.equal(JSON.parse(h.requests[0][1].body).url, 'https://islanddreams.re/checkout/succes');
});
