import { BannerForm } from '../BannerForm';
import { createAdminClient } from '@/lib/supabase/admin';

async function getProducts() {
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, status, tags')
    .order('name');

  if (!products || products.length === 0) return [];

  const { data: images } = await supabase
    .from('product_images')
    .select('product_id, url')
    .in('product_id', products.map((product) => product.id))
    .eq('is_main', true);

  const imageMap = new Map((images ?? []).map((image) => [image.product_id, image.url]));

  return products.map((product) => ({
    ...product,
    image_url: imageMap.get(product.id) ?? null,
  }));
}

export default async function NewBannerPage() {
  const products = await getProducts();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Nouvelle bannière</h1>
      <BannerForm products={products} />
    </div>
  );
}
