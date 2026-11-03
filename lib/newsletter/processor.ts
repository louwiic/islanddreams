import type { ClaimedCampaign, Delivery } from './queue';

type Dependencies = {
  command: <T>(action: string, payload?: object) => Promise<T>;
  message: (job: ClaimedCampaign, email: string) => Record<string, unknown>;
  send: (message: Record<string, unknown>, key: string) => Promise<{ ok: boolean; retry?: boolean; skipped?: boolean; id?: string; error?: string }>;
  sleep: (ms: number) => Promise<void>;
  now?: () => number;
};

export async function processNewsletterTick(deps: Dependencies, dryRun: boolean) {
  await deps.command('heartbeat', { dryRun });
  if (dryRun) return { dryRun: true, processed: 0 };
  const job = await deps.command<ClaimedCampaign | null>('claim');
  if (!job) return { idle: true, processed: 0 };
  const claim = { jobId: job.id, token: job.lease_token };
  const now = deps.now || Date.now;
  const start = now();
  let processed = 0;
  try {
    await deps.command('prepare', claim);
    while (processed < 10 && now() - start < 40000) {
      const delivery = await deps.command<Delivery | null>('next', claim);
      if (!delivery) break;
      const begun = await deps.command<Delivery | null>('begin', {
        ...claim, deliveryId: delivery.id, message: deps.message(job, delivery.email),
      });
      processed++;
      if (!begun?.message) continue;
      const result = await deps.send(begun.message, `newsletter/${job.id}/${begun.id}`);
      await deps.command('finish', {
        ...claim, deliveryId: begun.id, outcome: result.ok ? 'sent' : result.skipped ? 'skipped' : result.retry ? 'retry' : 'failed',
        providerId: result.id || null, error: result.error || null,
      });
      if (result.retry) break;
      await deps.sleep(1000);
    }
  } finally {
    // If an API request was accepted but the process crashed before checkpoint,
    // its frozen payload + idempotency key are replayed on the next lease.
    await deps.command('release', claim);
  }
  return { processed };
}
