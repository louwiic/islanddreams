import { createAdminClient } from '@/lib/supabase/admin';
import { TextileProductSelector } from '../TextileProductSelector';

async function getAvailableProducts() {
  const supabase = createAdminClient();

  const { data: selected } = await supabase
    .from('textile_highlights' as never)
    .select('product_id');

  const selectedIds = ((selected ?? []) as unknown as { product_id: string }[]).map((r) => r.product_id);

  // Seulement les produits textile, avec toutes leurs photos
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, category, product_images(id, url, is_main, position, alt)')
    .eq('category', 'textile')
    .order('name');

  return ((products ?? []) as unknown as Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
    product_images: { id: string; url: string; is_main: boolean; position: number; alt: string | null }[];
  }>)
    .filter((p) => !selectedIds.includes(p.id))
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      images: (p.product_images ?? []).sort((a, b) => {
        if (a.is_main) return -1;
        if (b.is_main) return 1;
        return a.position - b.position;
      }),
    }));
}

export default async function AjouterTextilePage() {
  const products = await getAvailableProducts();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-2">Ajouter au carousel textile</h1>
      <p className="text-sm text-gray-500 mb-6">
        Sélectionnez un produit textile et choisissez la photo à afficher
      </p>
      <TextileProductSelector products={products} />
    </div>
  );
}
