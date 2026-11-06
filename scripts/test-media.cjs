const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function route(asset) {
  const exports = {};
  const requests = [];
  const source = ts.transpileModule(fs.readFileSync('app/media/supabase/[...path]/route.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const recovered = JSON.parse(fs.readFileSync('lib/pgbase/recovered-media.json', 'utf8'));
  vm.runInNewContext(source, {
    exports, Response, URL, AbortSignal,
    require: id => {
      if (id === '@/lib/pgbase/media') return { recoveredMediaPath: key => recovered[key] };
      if (id === '@/lib/pgbase/http') return { pgbaseUrl: () => 'https://storage.example.com' };
      throw Error(id);
    },
    fetch: async (...args) => { requests.push(args); return asset || new Response(null, { status: 404 }); },
  });
  return { get: exports.GET, requests };
}

test('restored video redirects to the playable file without an internal fetch', async () => {
  const h = route();
  const response = await h.get(new Request('https://islanddreams.re/media/supabase/demo-videos/home-demo-whatsapp-2026-07-23.mp4', { headers: { Range: 'bytes=0-1023' } }), {
    params: Promise.resolve({ path: ['demo-videos', 'home-demo-whatsapp-2026-07-23.mp4'] }),
  });
  assert.equal(response.status, 307);
  assert.equal(response.headers.get('location'), '/videos/home-demo-whatsapp-2026-07-23.mp4');
  assert.equal(h.requests.length, 0);
});

test('restored assets do not redirect visitors to the proxy internal hostname', async () => {
  const h = route();
  const response = await h.get(new Request('http://0.0.0.0:3000/media/supabase/demo-videos/home-demo-whatsapp-2026-07-23.mp4'), {
    params: Promise.resolve({ path: ['demo-videos', 'home-demo-whatsapp-2026-07-23.mp4'] }),
  });
  assert.ok(response.headers.get('location').startsWith('/videos/'));
  assert.ok(!response.headers.get('location').includes('0.0.0.0'));
});

test('restored product images still return image bytes for the Next image optimizer', async () => {
  const h = route(new Response('image-bytes', { headers: { 'Content-Type': 'image/jpeg' } }));
  const response = await h.get(new Request('https://islanddreams.re/media/supabase/product-images/carte-magnetique-de-la-reunion/0.jpg'), {
    params: Promise.resolve({ path: ['product-images', 'carte-magnetique-de-la-reunion', '0.jpg'] }),
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'image/jpeg');
  assert.equal(response.headers.get('location'), null);
  assert.equal(await response.text(), 'image-bytes');
});

test('unrecognized buckets and traversal remain blocked', async () => {
  for (const path of [['private-documents', 'secret.pdf'], ['demo-videos', '..', 'secret'], ['demo-videos', '']]) {
    const h = route();
    const response = await h.get(new Request('https://islanddreams.re/media/supabase/x'), { params: Promise.resolve({ path }) });
    assert.equal(response.status, 404);
    assert.equal(h.requests.length, 0);
  }
});
