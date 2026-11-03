const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { spawn } = require('node:child_process');
const { once } = require('node:events');

test('real worker defaults to simulation, authenticates and stops gracefully', { timeout: 10000 }, async () => {
  let resolveRequest;
  const request = new Promise(resolve => { resolveRequest = resolve; });
  const server = createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ dryRun: true, processed: 0 }));
    resolveRequest({ url: req.url, authorization: req.headers.authorization, body: JSON.parse(body) });
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const secret = 'local-test-only-worker-secret-1234567890';
  const child = spawn(process.execPath, ['scripts/newsletter-worker.mjs'], {
    env: { PATH: process.env.PATH, NEWSLETTER_APP_URL: `http://127.0.0.1:${server.address().port}`, NEWSLETTER_WORKER_SECRET: secret },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk; });
  child.stderr.on('data', chunk => { output += chunk; });
  try {
    const observed = await request;
    assert.equal(observed.url, '/api/internal/newsletter/tick');
    assert.equal(observed.authorization, `Bearer ${secret}`);
    assert.equal(observed.body.dryRun, true);
    assert.ok(!output.includes(secret));
    const exited = once(child, 'exit');
    child.kill('SIGTERM');
    assert.equal((await exited)[0], 0);
  } finally {
    child.kill('SIGKILL');
    server.close();
  }
});
