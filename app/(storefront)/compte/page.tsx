import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AccountDashboard } from './AccountDashboard';

export default async function ComptePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/compte/connexion');

  const admin = createAdminClient();

  // Trouver le customer lié à ce compte
  const { data: customer } = await admin
    .from('customers')
    .select('id, first_name, last_name, email, auth_user_id')
    .eq('email', user.email!)
    .single();

  // Lier auth_user_id si pas encore fait
  if (customer && !customer.auth_user_id) {
    await admin
      .from('customers')
      .update({ auth_user_id: user.id })
      .eq('id', customer.id);
  }

  // Commandes + items avec product_id
  const { data: orders } = customer
    ? await admin
        .from('orders')
        .select(`
          id, order_number, status, total, subtotal, shipping_cost, created_at, shipping_address,
          order_items (id, product_id, product_name, variant_label, quantity, unit_price, total)
        `)
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })
    : { data: [] };

  // Récupérer les images produit (une par produit)
  const productIds = [
    ...new Set(
      (orders ?? [])
        .flatMap((o: any) => o.order_items ?? [])
        .map((i: any) => i.product_id)
        .filter(Boolean),
    ),
  ] as string[];

  const { data: images } = productIds.length
    ? await admin
        .from('product_images')
        .select('product_id, url, alt')
        .in('product_id', productIds)
        .eq('is_main', true)
    : { data: [] };

  const imageMap: Record<string, { url: string; alt: string | null }> = {};
  for (const img of images ?? []) {
    imageMap[img.product_id] = { url: img.url, alt: img.alt };
  }

  return (
    <AccountDashboard
      user={{ email: user.email!, id: user.id }}
      customer={customer}
      orders={(orders ?? []) as any}
      imageMap={imageMap}
    />
  );
}
