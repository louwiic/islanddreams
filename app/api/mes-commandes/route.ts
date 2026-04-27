import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Trouver le client
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (!customer) {
    // Pas d'erreur explicite (sécurité) — on renvoie juste un tableau vide
    return NextResponse.json({ orders: [] });
  }

  // Récupérer les commandes + items
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      total,
      created_at,
      shipping_address,
      order_items (
        id,
        product_name,
        variant_label,
        quantity,
        unit_price,
        total
      )
    `)
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ orders: orders ?? [] });
}
