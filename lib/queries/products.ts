import { createClient } from '@/lib/supabase/server';

/** Produits publiés avec leur image principale — pour le storefront */
export async function getPublishedProducts() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from('products')
    .select('id, slug, name, category, price, sale_price, featured')
    .eq('status', 'publish')
    .order('sort_order')
    .order('created_at', { ascending: false });

  if (!products || products.length === 0) return [];

  // Récupérer les images principales
  const productIds = products.map((p) => p.id);
  const { data: images } = await supabase
    .from('product_images')
    .select('product_id, url, alt')
    .in('product_id', productIds)
    .eq('is_main', true);

  const imageMap = new Map(
    (images ?? []).map((img) => [img.product_id, img])
  );

  return products.map((p) => ({
    ...p,
    image: imageMap.get(p.id) ?? null,
  }));
}

/** Produits par catégorie (slug) */
export async function getProductsByCategory(categorySlug: string) {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from('products')
    .select('id, slug, name, category, price, sale_price, featured')
    .eq('status', 'publish')
    .eq('category', categorySlug as any)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (!products || products.length === 0) return [];

  const productIds = products.map((p) => p.id);
  const { data: images } = await supabase
    .from('product_images')
    .select('product_id, url, alt')
    .in('product_id', productIds)
    .eq('is_main', true);

  const imageMap = new Map(
    (images ?? []).map((img) => [img.product_id, img])
  );

  return products.map((p) => ({
    ...p,
    image: imageMap.get(p.id) ?? null,
  }));
}

/** Produits featured */
export async function getFeaturedProducts() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from('products')
    .select('id, slug, name, category, price, sale_price, featured')
    .eq('status', 'publish')
    .eq('featured', true)
    .order('created_at', { ascending: false });

  if (!products || products.length === 0) return [];

  const productIds = products.map((p) => p.id);
  const { data: images } = await supabase
    .from('product_images')
    .select('product_id, url, alt')
    .in('product_id', productIds)
    .eq('is_main', true);

  const imageMap = new Map(
    (images ?? []).map((img) => [img.product_id, img])
  );

  return products.map((p) => ({
    ...p,
    image: imageMap.get(p.id) ?? null,
  }));
}
