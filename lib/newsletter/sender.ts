import 'server-only';
import { setTimeout as sleep } from 'node:timers/promises';
import { campaignEmail } from '@/lib/email/templates';
import { unsubscribeUrl } from './token';
import type { ClaimedCampaign } from './queue';

export function scheduledMessage(job: ClaimedCampaign, email: string) {
  const tpl = campaignEmail(job.subject, job.html, email);
  return {
    from: process.env.RESEND_FROM || 'Island Dreams <contact@islanddreams.re>',
    to: [email], subject: tpl.subject, html: tpl.html,
    headers: { 'List-Unsubscribe': `<${unsubscribeUrl(email)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  };
}

export async function sendScheduledMessage(message: Record<string, unknown>, key: string) {
  if (!process.env.RESEND_API_KEY) throw new Error('Transport email non configuré.');
  try {
    const recipient = Array.isArray(message.to) && message.to.length === 1 ? message.to[0] : null;
    if (typeof recipient !== 'string') return { ok: false, error: 'invalid_recipient' };
    // Historical broadcasts can record an opt-out at Resend without updating our DB.
    // Check both the global contact and the legacy audience, without resubscribing it.
    const paths = [`/contacts/${encodeURIComponent(recipient)}`];
    if (process.env.RESEND_AUDIENCE_ID) paths.push(`/audiences/${encodeURIComponent(process.env.RESEND_AUDIENCE_ID)}/contacts/${encodeURIComponent(recipient)}`);
    for (const path of paths) {
      const contact = await fetch(`https://api.resend.com${path}`, {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        cache: 'no-store', signal: AbortSignal.timeout(8000),
      });
      if (contact.status !== 404) {
        if (!contact.ok) return { ok: false, retry: contact.status === 429 || contact.status >= 500, error: `contact_http_${contact.status}` };
        const body = await contact.json();
        if (body.unsubscribed === true) return { ok: false, skipped: true, error: 'provider_unsubscribed' };
        if (body.unsubscribed !== false) return { ok: false, retry: true, error: 'contact_invalid_response' };
      }
      await sleep(650);
    }
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': key },
      body: JSON.stringify(message), signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return { ok: false, retry: response.status === 429 || response.status >= 500 || response.status === 409, error: `provider_http_${response.status}` };
    const body = await response.json();
    if (!body.id) return { ok: false, retry: true, error: 'provider_invalid_response' };
    return { ok: true, id: String(body.id) };
  } catch {
    return { ok: false, retry: true, error: 'provider_connection_unknown' };
  }
}
