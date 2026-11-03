import { readFile, writeFile } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';

const healthFile = '/tmp/newsletter-worker-health';
if (process.argv.includes('--health')) {
  try { process.exit(Date.now() - Number(await readFile(healthFile, 'utf8')) < 180000 ? 0 : 1); }
  catch { process.exit(1); }
}
const origin = new URL(process.env.NEWSLETTER_APP_URL || 'https://islanddreams.re');
if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password) throw new Error('Invalid app URL');
const endpoint = new URL('/api/internal/newsletter/tick', origin);
const secret = process.env.NEWSLETTER_WORKER_SECRET;
if (!secret || secret.length < 32) throw new Error('NEWSLETTER_WORKER_SECRET must contain at least 32 characters');
const dryRun = process.env.NEWSLETTER_WORKER_DRY_RUN !== 'false';
const stop = new AbortController();
process.on('SIGTERM', () => stop.abort());
process.on('SIGINT', () => stop.abort());
console.log(`[newsletter-worker] Started (${dryRun ? 'dry run' : 'sending enabled'}).`);
while (!stop.signal.aborted) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST', redirect: 'error',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ dryRun }), signal: AbortSignal.any([stop.signal, AbortSignal.timeout(90000)]),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    await writeFile(healthFile, String(Date.now()));
    if (result.processed) console.log(`[newsletter-worker] Processed ${result.processed} delivery attempts.`);
  } catch {
    if (!stop.signal.aborted) console.error('[newsletter-worker] Tick failed; next attempt in 15 seconds.');
  }
  try { await sleep(15000, undefined, { signal: stop.signal }); } catch { /* graceful shutdown */ }
}
