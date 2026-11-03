import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { reunionDateToIso, validateSchedule } from '../lib/newsletter/scheduling';
import { processNewsletterTick } from '../lib/newsletter/processor';

async function main() {
  assert.equal(reunionDateToIso('2026-12-03T20:00'), '2026-12-03T16:00:00.000Z');
  assert.throws(() => reunionDateToIso('2026-02-30T20:00'));
  const base = { subject: 'Test', html: '<p>Test</p>', scheduledAt: '2026-12-03T16:00:00.000Z', requestKey: '11111111-1111-4111-8111-111111111111' };
  assert.equal(validateSchedule(base, Date.parse('2026-11-03')).scheduledAt, base.scheduledAt);
  assert.throws(() => validateSchedule({ ...base, scheduledAt: '2026-12-03T20:00' }, Date.parse('2026-11-03')));
  assert.throws(() => validateSchedule({ ...base, html: '' }, Date.parse('2026-11-03')));
  const actions: string[] = [];
  let sends = 0;
  let next = 0;
  const frozen = { subject: 'Frozen original', html: 'Frozen body', to: ['fixture@example.invalid'] };
  const deps: Parameters<typeof processNewsletterTick>[0] = {
    command: async <T>(action: string, payload?: object): Promise<T> => {
      actions.push(action);
      if (action === 'claim') return { id: 'job', lease_token: 'token', subject: 'Changed subject', html: 'Changed body' } as T;
      if (action === 'next') return (next++ === 0 ? { id: 'delivery', email: 'fixture@example.invalid' } : null) as T;
      if (action === 'begin') return { id: 'delivery', message: frozen } as T;
      if (action === 'finish') assert.equal((payload as { outcome: string }).outcome, 'sent');
      return { ok: true } as T;
    },
    message: () => ({ subject: 'New payload ignored on replay' }),
    send: async (body, key) => { sends++; assert.equal(body, frozen); assert.equal(key, 'newsletter/job/delivery'); return { ok: true, id: 'provider-id' }; },
    sleep: async () => {},
  };
  await processNewsletterTick(deps, true);
  assert.deepEqual(actions, ['heartbeat']); assert.equal(sends, 0);
  actions.length = 0;
  await processNewsletterTick(deps, false);
  assert.equal(sends, 1); assert.equal(actions.at(-1), 'release');
  // An unexpected interruption must release the job for recovery, never mark it sent.
  deps.command = async <T>(action: string): Promise<T> => {
    actions.push(action);
    if (action === 'claim') return { id: 'job', lease_token: 'token' } as T;
    if (action === 'prepare') throw new Error('Simulated interrupted database call');
    return null as T;
  };
  await assert.rejects(() => processNewsletterTick(deps, false));
  assert.equal(actions.at(-1), 'release');
  console.log('Timezone, validation, dry-run, frozen payload and recovery checks passed.');

  const dsn = process.env.NEWSLETTER_TEST_DSN;
  if (!dsn) throw new Error('Set NEWSLETTER_TEST_DSN to a disposable local islanddreams_newsletter_test database.');
  const target = new URL(dsn);
  assert.ok(['localhost', '127.0.0.1'].includes(target.hostname));
  assert.equal(target.pathname, '/islanddreams_newsletter_test');
  const sql = (statement: string) => execFileSync('psql', [dsn, '-XAtq', '-v', 'ON_ERROR_STOP=1'], { input: statement, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  const literal = (value: unknown) => "'" + JSON.stringify(value).replaceAll("'", "''") + "'::jsonb";
  const call = (action: string, payload: object = {}) => JSON.parse(sql(`SELECT app.newsletter_queue('${action}',${literal(payload)})`) || 'null');
  sql('CREATE SCHEMA IF NOT EXISTS app; CREATE TABLE IF NOT EXISTS app.newsletter_subscribers(email text,unsubscribed_at timestamptz);');
  sql(readFileSync('scripts/pgbase/newsletter-queue.sql', 'utf8'));
  sql('TRUNCATE app.newsletter_deliveries,app.newsletter_jobs,app.newsletter_subscribers;');
  const future = new Date(Date.now() + 3600000).toISOString();
  const input = { ...base, scheduledAt: future, fingerprint: 'same-snapshot' };
  const job = call('enqueue', input);
  assert.equal(call('enqueue', input).id, job.id);
  assert.throws(() => call('enqueue', { ...input, fingerprint: 'different-snapshot' }));
  assert.equal(call('claim'), null, 'Future campaigns cannot start early');
  sql(`UPDATE app.newsletter_jobs SET scheduled_at=now()-interval '1 minute'; INSERT INTO app.newsletter_subscribers VALUES ('A@example.invalid',NULL),('a@example.invalid',NULL),('b@example.invalid',NULL),('unsub@example.invalid',now());`);
  const claimed = call('claim');
  assert.ok(claimed.lease_token);
  assert.equal(call('claim'), null, 'A second worker cannot claim an unexpired lease');
  const claim = { jobId: job.id, token: claimed.lease_token };
  call('prepare', claim); call('prepare', claim);
  assert.equal(Number(sql('SELECT count(*) FROM app.newsletter_deliveries')), 2, 'Snapshot is deduplicated and repeatable');
  sql("UPDATE app.newsletter_subscribers SET unsubscribed_at=now() WHERE lower(email)='a@example.invalid';");
  const rowA = JSON.parse(sql("SELECT to_jsonb(d) FROM app.newsletter_deliveries d WHERE email='a@example.invalid'"));
  assert.equal(call('begin', { ...claim, deliveryId: rowA.id, message: frozen }), null, 'Late unsubscribe is excluded');
  const rowB = call('next', claim);
  let started = call('begin', { ...claim, deliveryId: rowB.id, message: frozen });
  assert.deepEqual(started.message, frozen);
  // Crash after provider acceptance, before DB checkpoint: recover using the exact payload.
  sql("UPDATE app.newsletter_jobs SET lease_until=now()-interval '1 minute';");
  const replacement = call('claim');
  assert.equal(call('finish', { ...claim, deliveryId: rowB.id, outcome: 'sent' }), null, 'Stale worker cannot mutate a newer lease');
  const claim2 = { jobId: job.id, token: replacement.lease_token };
  started = call('begin', { ...claim2, deliveryId: rowB.id, message: { html: 'changed' } });
  assert.deepEqual(started.message, frozen);
  call('finish', { ...claim2, deliveryId: rowB.id, outcome: 'sent', providerId: 'fake-provider' });
  call('release', claim2);
  assert.equal(call('claim'), null, 'Completed campaign cannot be sent again');
  assert.equal(call('list').jobs[0].sent, 1);
  assert.equal(call('list').jobs[0].skipped, 1);
  const cancelled = call('enqueue', { ...input, requestKey: '22222222-2222-4222-8222-222222222222' });
  assert.equal(call('cancel', { id: cancelled.id }).cancelled, true);
  const expired = call('enqueue', { ...input, requestKey: '33333333-3333-4333-8333-333333333333' });
  sql(`UPDATE app.newsletter_jobs SET scheduled_at=now()-interval '1 minute' WHERE id='${expired.id}';`);
  const old = call('claim'); const oldClaim = { jobId: old.id, token: old.lease_token };
  call('prepare', oldClaim);
  const oldDelivery = call('next', oldClaim);
  sql(`UPDATE app.newsletter_deliveries SET first_attempt_at=now()-interval '25 hours',attempts=1 WHERE id='${oldDelivery.id}';`);
  assert.equal(call('begin', { ...oldClaim, deliveryId: oldDelivery.id, message: frozen }), null, 'Expired idempotency window requires manual review');
  call('release', oldClaim);
  assert.equal(call('list').jobs[0].status, 'completed_with_errors');
  const retryJob = call('enqueue', { ...input, requestKey: '44444444-4444-4444-8444-444444444444' });
  sql(`UPDATE app.newsletter_jobs SET scheduled_at=now()-interval '2 minutes' WHERE id='${retryJob.id}';`);
  let retryClaim = call('claim');
  // Releasing a job before snapshot preparation must not silently complete it.
  call('release', { jobId: retryClaim.id, token: retryClaim.lease_token });
  assert.equal(call('list').jobs[0].status, 'scheduled');
  retryClaim = call('claim');
  const retryToken = { jobId: retryClaim.id, token: retryClaim.lease_token };
  call('prepare', retryToken);
  const retryDelivery = call('next', retryToken);
  call('begin', { ...retryToken, deliveryId: retryDelivery.id, message: frozen });
  call('finish', { ...retryToken, deliveryId: retryDelivery.id, outcome: 'retry', error: 'provider_http_429' });
  call('release', retryToken);
  assert.equal(call('claim'), null, 'Backoff is respected');
  const following = call('enqueue', { ...input, requestKey: '55555555-5555-4555-8555-555555555555' });
  sql(`UPDATE app.newsletter_jobs SET scheduled_at=now()-interval '1 minute' WHERE id='${following.id}';`);
  const followingClaim = call('claim');
  assert.equal(followingClaim.id, following.id, 'A retrying campaign does not starve following campaigns');
  const followingToken = { jobId: followingClaim.id, token: followingClaim.lease_token };
  call('prepare', followingToken);
  const suppressed = call('next', followingToken);
  call('begin', { ...followingToken, deliveryId: suppressed.id, message: frozen });
  call('finish', { ...followingToken, deliveryId: suppressed.id, outcome: 'skipped', error: 'provider_unsubscribed' });
  call('release', followingToken);
  assert.equal(call('list').jobs[0].skipped, 1, 'Provider opt-outs are excluded, not counted as accepted');
  console.log('PostgreSQL queue: duplicates, leases, unsubscribe, cancellation, crash recovery and replay cutoff passed. No email sent.');
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Test failed'); process.exitCode = 1; });
