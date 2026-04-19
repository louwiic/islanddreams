'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function getDashboardStats() {
  const supabase = createAdminClient();

  const [
    { data: products },
    { data: orders },
    { data: customers },
    { data: lowStockProducts },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('products').select('id, status'),
    supabase
      .from('orders')
      .select('total, status, created_at')
      .not('status', 'in', '("cancelled","refunded")'),
    supabase.from('customers').select('id'),
    supabase
      .from('products')
      .select('id, name, slug, category, stock_quantity, low_stock_threshold')
      .eq('manage_stock', true)
      .eq('status', 'publish')
      .lt('stock_quantity', 10)
      .order('stock_quantity')
      .limit(5),
    supabase
      .from('orders')
      .select('id, order_number, total, status, created_at, customers(email, first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  // CA total
  const revenue = (orders ?? []).reduce((sum, o) => sum + o.total, 0);

  // CA du mois
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthRevenue = (orders ?? [])
    .filter((o) => o.created_at && o.created_at >= monthStart)
    .reduce((sum, o) => sum + o.total, 0);

  const monthOrders = (orders ?? []).filter(
    (o) => o.created_at && o.created_at >= monthStart
  ).length;

  // Commandes en attente
  const pendingOrders = (orders ?? []).filter(
    (o) => o.status === 'pending' || o.status === 'confirmed' || o.status === 'preparing'
  ).length;

  return {
    totalProducts: (products ?? []).filter((p) => p.status === 'publish').length,
    totalOrders: (orders ?? []).length,
    totalCustomers: (customers ?? []).length,
    revenue,
    monthRevenue,
    monthOrders,
    pendingOrders,
    lowStock: (lowStockProducts ?? []).map((p) => ({
      name: p.name,
      slug: p.slug,
      stock: p.stock_quantity ?? 0,
      threshold: p.low_stock_threshold ?? 5,
      category: p.category,
    })),
    recentOrders: (recentOrders ?? []).map((o) => {
      const customer = o.customers as any;
      return {
        id: o.id,
        orderNumber: o.order_number,
        total: o.total,
        status: o.status ?? 'pending',
        date: o.created_at,
        clientName: customer
          ? `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim() || customer.email
          : 'Anonyme',
      };
    }),
  };
}
