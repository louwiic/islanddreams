import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { abandonedCartReminder } from '@/lib/email/templates';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const db = createAdminClient() as any;
  const now = new Date();
  const staleClaim = new Date(now.getTime() - 15 * 60 * 1000).toISOString();
  await db
    .from('abandoned_carts')
    .update({ status: 'active', updated_at: now.toISOString() })
    .eq('status', 'sending')
    .lt('updated_at', staleClaim);

  await db
    .from('abandoned_carts')
    .update({ status: 'expired', next_reminder_at: null, updated_at: now.toISOString() })
    .eq('status', 'active')
    .lt('expires_at', now.toISOString());

  const { data: carts, error } = await db
    .from('abandoned_carts')
    .select('*')
    .eq('status', 'active')
    .lte('next_reminder_at', now.toISOString())
    .lt('reminder_count', 2)
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  for (const cart of carts || []) {
    // Claim the row first so two cron executions cannot send the same reminder.
    const { data: claimed } = await db
      .from('abandoned_carts')
      .update({ status: 'sending', updated_at: now.toISOString() })
      .eq('id', cart.id)
      .eq('status', 'active')
      .eq('reminder_count', cart.reminder_count)
      .select('id')
      .maybeSingle();
    if (!claimed) continue;

    const reminderNumber = Number(cart.reminder_count) + 1;
    const template = abandonedCartReminder({
      name: cart.customer_name,
      items: cart.items,
      total: Number(cart.cart_total),
      token: cart.recovery_token,
      reminderNumber,
    });
    const result = await sendEmail({ to: cart.email, ...template });
    if (!result.ok) {
      await db
        .from('abandoned_carts')
        .update({
          status: 'active',
          next_reminder_at: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('id', cart.id)
        .eq('status', 'sending');
      continue;
    }

    await db
      .from('abandoned_carts')
      .update({
        status: 'active',
        reminder_count: reminderNumber,
        last_reminder_at: now.toISOString(),
        next_reminder_at:
          reminderNumber >= 2
            ? null
            : new Date(now.getTime() + 22 * 60 * 60 * 1000).toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', cart.id)
      .eq('status', 'sending');
    sent += 1;
  }

  return NextResponse.json({ processed: carts?.length || 0, sent });
}
