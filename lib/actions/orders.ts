'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export async function getOrders(status?: string) {
  const supabase = createAdminClient();
  let query = supabase
    .from('orders')
    .select('*, customers(email, first_name, last_name)')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status as any);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getOrderById(id: string) {
  const supabase = createAdminClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, customers(email, first_name, last_name, phone, addresses)')
    .eq('id', id)
    .single();

  if (error) return null;

  const { data: items } = await supabase
    .from('order_items')
    .select('*, products(slug, name)')
    .eq('order_id', id);

  return { ...order, items: items ?? [] };
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('orders')
    .update({ status: status as any })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/commandes');
  revalidatePath(`/admin/commandes/${id}`);
  return { success: true };
}

export async function getOrderStats() {
  const supabase = createAdminClient();

  const { data: orders } = await supabase
    .from('orders')
    .select('status, total, created_at');

  if (!orders) return { total: 0, revenue: 0, byStatus: {} as Record<string, number> };

  const byStatus: Record<string, number> = {};
  let revenue = 0;

  for (const o of orders) {
    byStatus[o.status ?? 'pending'] = (byStatus[o.status ?? 'pending'] ?? 0) + 1;
    if (o.status !== 'cancelled' && o.status !== 'refunded') {
      revenue += o.total;
    }
  }

  return { total: orders.length, revenue, byStatus };
}
