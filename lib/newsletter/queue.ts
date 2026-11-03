import 'server-only';
import { createHash } from 'node:crypto';
import { pgbaseJson } from '@/lib/pgbase/http';
import { sqlLiteral } from '@/lib/pgbase/query';
import { validateSchedule } from './scheduling';

export type ScheduledCampaign = {
  id: string; subject: string; scheduled_at: string; created_at: string;
  status: 'scheduled' | 'sending' | 'completed' | 'completed_with_errors' | 'cancelled';
  total: number; sent: number; skipped: number; failed: number; last_error: string | null;
};
export type QueueState = { jobs: ScheduledCampaign[]; worker: { last_seen_at: string; dry_run: boolean } | null };
export type ClaimedCampaign = { id: string; subject: string; html: string; lease_token: string; prepared_at: string | null };
export type Delivery = { id: string; email: string; attempts: number; message: Record<string, unknown> | null };

export async function queueCommand<T>(action: string, payload: object = {}): Promise<T> {
  const response = await pgbaseJson('/rpc/islanddreams_query', {
    statement: `SELECT app.newsletter_queue(${sqlLiteral(action)},${sqlLiteral(payload)}::jsonb)`,
    claims: { role: 'service_role' }, access_role: 'service_role',
  });
  return (typeof response.data === 'string' ? JSON.parse(response.data) : response.data) as T;
}

export async function scheduleCampaign(input: Parameters<typeof validateSchedule>[0]) {
  const clean = validateSchedule(input);
  const fingerprint = createHash('sha256').update(JSON.stringify({ subject: clean.subject, html: clean.html, scheduledAt: clean.scheduledAt })).digest('hex');
  return queueCommand<{ id: string }>('enqueue', { ...clean, fingerprint });
}
