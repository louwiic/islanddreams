'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { CartItem } from '@/lib/cart/types';

export type AbandonedCartStatus = 'active' | 'sending' | 'completed' | 'cancelled' | 'expired';

export type AbandonedCartRow = {
  id: string;
  recovery_token: string;
  email: string;
  customer_name: string | null;
  items: CartItem[];
  cart_total: number;
  status: AbandonedCartStatus;
  reminder_count: number;
  next_reminder_at: string | null;
  last_reminder_at: string | null;
  completed_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

export type AbandonedCartStats = {
  total: number;
  active: number;
  completed: number;
  sentReminders: number;
  activeValue: number;
};

function normalizeCart(row: Record<string, unknown>): AbandonedCartRow {
  return {
    id: String(row.id),
    recovery_token: String(row.recovery_token),
    email: String(row.email),
    customer_name: typeof row.customer_name === 'string' ? row.customer_name : null,
    items: Array.isArray(row.items) ? (row.items as CartItem[]) : [],
    cart_total: Number(row.cart_total) || 0,
    status: String(row.status) as AbandonedCartStatus,
    reminder_count: Number(row.reminder_count) || 0,
    next_reminder_at: typeof row.next_reminder_at === 'string' ? row.next_reminder_at : null,
    last_reminder_at: typeof row.last_reminder_at === 'string' ? row.last_reminder_at : null,
    completed_at: typeof row.completed_at === 'string' ? row.completed_at : null,
    expires_at: String(row.expires_at),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function getAbandonedCarts() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('abandoned_carts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  const carts = ((data ?? []) as Record<string, unknown>[]).map(normalizeCart);
  const stats: AbandonedCartStats = {
    total: carts.length,
    active: carts.filter((cart) => cart.status === 'active' || cart.status === 'sending').length,
    completed: carts.filter((cart) => cart.status === 'completed').length,
    sentReminders: carts.reduce((sum, cart) => sum + cart.reminder_count, 0),
    activeValue: carts
      .filter((cart) => cart.status === 'active' || cart.status === 'sending')
      .reduce((sum, cart) => sum + cart.cart_total, 0),
  };

  return { carts, stats };
}

export async function cancelAbandonedCart(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('abandoned_carts')
    .update({
      status: 'cancelled',
      next_reminder_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/admin/paniers-abandonnes');
  return { success: true };
}

export async function reactivateAbandonedCart(id: string) {
  const now = new Date();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('abandoned_carts')
    .update({
      status: 'active',
      next_reminder_at: now.toISOString(),
      expires_at: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', id)
    .neq('status', 'completed');

  if (error) return { error: error.message };
  revalidatePath('/admin/paniers-abandonnes');
  return { success: true };
}
