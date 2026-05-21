import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const body = await req.json();
  const { customer_name, customer_email, order_number, rating, comment } = body;

  if (!customer_name || !comment || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from('reviews' as never).insert({
    customer_name,
    customer_email: customer_email || null,
    order_number: order_number || null,
    rating,
    comment,
    is_approved: false,
  } as never);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
