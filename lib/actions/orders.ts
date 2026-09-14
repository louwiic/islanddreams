'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/admin';
import { sendEmail } from '@/lib/email/send';
import { orderShipped } from '@/lib/email/templates';
import type { Database } from '@/lib/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

const ORDER_STATUSES = new Set([
  'pending',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);

export async function getOrders(status?: string) {
  const supabase = createAdminClient();
  let query = supabase
    .from('orders')
    .select('*, customers(email, first_name, last_name)')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status as 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded');
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
  await requireAdmin();
  if (!ORDER_STATUSES.has(status)) return { error: 'Statut de commande invalide.' };
  if (status === 'shipped') {
    return { error: "Utilisez la confirmation d'expédition pour envoyer l'email au client." };
  }

  const supabase = createAdminClient();

  const { data: currentOrder, error: currentOrderError } = await supabase
    .from('orders')
    .select('status')
    .eq('id', id)
    .single();

  if (currentOrderError || !currentOrder) return { error: 'Commande introuvable.' };
  if (currentOrder.status === 'shipped') {
    return { error: 'Cette commande est expédiée et son statut ne peut plus être modifié.' };
  }

  const { error } = await supabase
    .from('orders')
    .update({ status: status as OrderStatus })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/commandes');
  revalidatePath(`/admin/commandes/${id}`);
  return { success: true };
}

export async function markOrderAsShipped(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, order_number, status, customers(email, first_name, last_name)')
    .eq('id', id)
    .single();

  if (orderError || !order) return { error: 'Commande introuvable.' };
  if (order.status === 'shipped') {
    return { error: 'Cette commande est déjà expédiée et son statut est verrouillé.' };
  }

  const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
  if (!customer?.email) {
    return { error: "Adresse email client introuvable. L'expédition n'a pas été confirmée." };
  }

  const customerName = `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim() || 'Client';
  const email = orderShipped({
    orderNumber: order.order_number,
    customerName,
  });
  const emailResult = await sendEmail({ to: customer.email, ...email });

  if (!emailResult.ok) {
    console.error('[Orders] Expédition non confirmée, email client en échec', {
      orderId: id,
      error: emailResult.error,
    });
    return { error: "L'email client n'a pas pu être envoyé. La commande reste modifiable." };
  }

  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update({ status: 'shipped' })
    .eq('id', id)
    .neq('status', 'shipped')
    .select('id')
    .maybeSingle();

  if (updateError || !updatedOrder) {
    return { error: "L'email a été envoyé, mais le statut n'a pas pu être verrouillé. Vérifiez la commande avant de recommencer." };
  }

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
