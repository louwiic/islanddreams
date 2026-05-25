import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { reviewNotification } from '@/lib/email/templates';

const REVIEW_NOTIFICATION_EMAIL = process.env.REVIEW_NOTIFICATION_EMAIL || 'islanddreams974@gmail.com';

export async function POST(req: Request) {
  const body = await req.json();
  const { customer_name, customer_email, order_number, rating, comment } = body;
  const numericRating = Number(rating);

  if (!customer_name || !comment || !numericRating || numericRating < 1 || numericRating > 5) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from('reviews' as never).insert({
    customer_name,
    customer_email: customer_email || null,
    order_number: order_number || null,
    rating: numericRating,
    comment,
    is_approved: false,
  } as never);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    const tpl = reviewNotification({
      customerName: customer_name,
      customerEmail: customer_email || null,
      orderNumber: order_number || null,
      rating: numericRating,
      comment,
    });
    const result = await sendEmail({
      to: REVIEW_NOTIFICATION_EMAIL,
      ...tpl,
      replyTo: customer_email || undefined,
    });
    if (!result.ok) {
      console.error('[REVIEWS] Notification email failed:', result.error);
    }
  } catch (emailError) {
    console.error('[REVIEWS] Notification email error:', emailError);
  }

  return NextResponse.json({ ok: true });
}
