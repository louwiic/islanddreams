'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function getCustomers() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getCustomerStats() {
  const supabase = createAdminClient();

  const { data: customers } = await supabase
    .from('customers')
    .select('id');

  const { data: orders } = await supabase
    .from('orders')
    .select('customer_id, total')
    .not('status', 'in', '("cancelled","refunded")');

  const ordersByCustomer = new Map<string, { count: number; total: number }>();
  for (const o of orders ?? []) {
    if (!o.customer_id) continue;
    const existing = ordersByCustomer.get(o.customer_id) ?? { count: 0, total: 0 };
    existing.count++;
    existing.total += o.total;
    ordersByCustomer.set(o.customer_id, existing);
  }

  return {
    totalCustomers: customers?.length ?? 0,
    ordersByCustomer,
  };
}
