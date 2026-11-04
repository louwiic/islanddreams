import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(env = { NODE_ENV: 'production' }) {
  let signIns = 0;
  const cache = new Map();
  function module(file) {
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    const source = ts.transpileModule(readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    vm.runInNewContext(source, {
      exports, URL, Headers, Set, process: { env },
      require: name => {
        if (name === 'next/headers') return { cookies: async () => ({}) };
        if (name === 'next/server') return { NextResponse: { json: (value, init) => Response.json(value, init) } };
        if (name === '@/lib/auth/request-origin') return module('lib/auth/request-origin.ts');
        if (name === '@/lib/pgbase/auth') return { createServerAuth: () => ({
          signInWithPassword: async () => { signIns++; return { data: { user: { id: 'fixture' } }, error: null }; },
        }) };
        throw Error(name);
      },
    });
    cache.set(file, exports);
    return exports;
  }
  return {
    allowed: module('lib/auth/request-origin.ts').isAllowedAuthOrigin,
    post: module('app/api/auth/[action]/route.ts').POST,
    signIns: () => signIns,
  };
}
const request = (origin, url = 'http://0.0.0.0:3000/api/auth/signin', extra = {}) => new Request(url, {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...(origin === undefined ? {} : { Origin: origin }), ...extra },
  body: JSON.stringify({ email: 'fixture@example.invalid', password: 'mock-password-never-sent' }),
});
const params = { params: Promise.resolve({ action: 'signin' }) };

test('both public domains can sign in behind the HTTP Docker reverse proxy', async () => {
  const h = load();
  for (const origin of ['https://www.islanddreams.re', 'https://islanddreams.re']) {
    const response = await h.post(request(origin), params);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).data.user.id, 'fixture');
  }
  assert.equal(h.signIns(), 2);
});
test('external, null, lookalike and insecure origins are rejected before authentication', async () => {
  const h = load();
  for (const origin of ['https://evil.example', 'null', '', 'https://www.islanddreams.re.evil.example', 'http://www.islanddreams.re', 'http://0.0.0.0:3000']) {
    const response = await h.post(request(origin, undefined, { 'x-forwarded-host': 'evil.example', 'x-forwarded-proto': 'https' }), params);
    assert.equal(response.status, 403);
  }
  assert.equal(h.signIns(), 0);
});
test('spoofing proxy headers or the internal request URL does not allow an external origin', () => {
  const h = load();
  assert.equal(h.allowed(request('https://evil.example', 'https://evil.example/api/auth/signin', { Host: 'evil.example' })), false);
});
test('server-configured canonical origins and Vercel previews remain supported', () => {
  const h = load({ NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://shop.example', VERCEL: '1', VERCEL_URL: 'islanddreams-preview.vercel.app' });
  assert.equal(h.allowed(request('https://shop.example')), true);
  assert.equal(h.allowed(request('https://islanddreams-preview.vercel.app')), true);
  assert.equal(h.allowed(request('https://another.vercel.app')), false);
  const invalid = load({ NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: '[SENSITIVE]', VERCEL: '1', VERCEL_URL: 'evil.example/path' });
  assert.equal(invalid.allowed(request('https://evil.example')), false);
});
test('development accepts its local origin and server calls can omit Origin', () => {
  const h = load({ NODE_ENV: 'development' });
  assert.equal(h.allowed(request('http://localhost:3137', 'http://localhost:3137/api/auth/signin')), true);
  assert.equal(h.allowed(request('https://evil.example', 'http://localhost:3137/api/auth/signin')), false);
  assert.equal(load().allowed(request(undefined)), true);
});
