import { createAdminClient } from '@/lib/supabase/admin';
import { TextileProductSelector } from '../TextileProductSelector';

async function getAvailableProducts() {
  const supabase = createAdminClient();

  // Produits déjà sélectionnés
  const { data: selected } = await supabase
    .from('textile_highlights' as never)
    .select('product_id');

  const selectedIds = ((selected ?? []) as unknown as { product_id: string }[]).map((r) => r.product_id);

  // Tous les produits avec image principale
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, category, product_images!inner(url, is_main)')
    .order('category')
    .order('name');

  return ((products ?? []) as unknown as Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
    product_images: { url: string; is_main: boolean }[];
  }>)
    .filter((p) => !selectedIds.includes(p.id))
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      image_url: p.product_images?.find((i) => i.is_main)?.url ?? p.product_images?.[0]?.url ?? null,
    }));
}

export default async function AjouterTextilePage() {
  const products = await getAvailableProducts();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-2">Ajouter au carousel textile</h1>
      <p className="text-sm text-gray-500 mb-6">Sélectionnez un produit existant à mettre en avant</p>
      <TextileProductSelector products={products} />
    </div>
  );
}
