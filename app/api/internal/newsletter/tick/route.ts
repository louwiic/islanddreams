import { timingSafeEqual } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';
import { NextRequest, NextResponse } from 'next/server';
import { queueCommand } from '@/lib/newsletter/queue';
import { processNewsletterTick } from '@/lib/newsletter/processor';
import { scheduledMessage, sendScheduledMessage } from '@/lib/newsletter/sender';

export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  const secret = process.env.NEWSLETTER_WORKER_SECRET;
  if (!secret || secret.length < 32) return NextResponse.json({ error: 'Service non configuré.' }, { status: 503 });
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(request.headers.get('authorization') || '');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  try {
    const { dryRun = true } = await request.json();
    const dry = dryRun !== false || process.env.NEWSLETTER_AUTOMATION_ENABLED !== 'true';
    if (!dry && !process.env.RESEND_API_KEY) return NextResponse.json({ error: 'Transport email non configuré.' }, { status: 503 });
    const result = await processNewsletterTick({ command: queueCommand, message: scheduledMessage, send: sendScheduledMessage, sleep }, dry);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    console.error('[newsletter-worker] Tick interrupted; durable queue retained.');
    return NextResponse.json({ error: 'Traitement interrompu ; reprise au prochain passage.' }, { status: 503 });
  }
}
