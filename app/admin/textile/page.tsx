import { createAdminClient } from '@/lib/supabase/admin';
import { Plus, Shirt } from 'lucide-react';
import Link from 'next/link';
import { TextileActions } from './TextileActions';

type TextileHighlight = {
  id: string;
  position: number;
  is_active: boolean;
  product: {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
  };
};

async function getTextileItems(): Promise<TextileHighlight[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('textile_highlights' as never)
    .select(`
      id, position, is_active,
      product:product_id (
        id, name, slug,
        product_images!inner (url, is_main)
      )
    `)
    .order('position', { ascending: true });

  if (!data) return [];

  return (data as unknown as Array<{
    id: string;
    position: number;
    is_active: boolean;
    product: { id: string; name: string; slug: string; product_images: { url: string; is_main: boolean }[] };
  }>).map((row) => ({
    id: row.id,
    position: row.position,
    is_active: row.is_active,
    product: {
      id: row.product.id,
      name: row.product.name,
      slug: row.product.slug,
      image_url: row.product.product_images?.find((i) => i.is_main)?.url
        ?? row.product.product_images?.[0]?.url
        ?? null,
    },
  }));
}

export default async function TextileAdminPage() {
  const items = await getTextileItems();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">Carousel Textile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sélectionnez les produits mis en avant dans le bloc plage
          </p>
        </div>
        <Link
          href="/admin/textile/ajouter"
          className="inline-flex items-center gap-2 px-4 py-2 bg-jungle-600 hover:bg-jungle-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Ajouter un produit
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Shirt size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Aucun produit textile sélectionné</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border overflow-hidden ${
                item.is_active ? 'border-gray-200' : 'border-gray-200 opacity-50'
              }`}
            >
              {/* Image */}
              <div className="aspect-[3/4] bg-gray-50 relative">
                {item.product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Shirt size={40} />
                  </div>
                )}
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-ink/70 text-white text-[10px] font-bold rounded-full">
                  Position {item.position}
                </span>
                {!item.is_active && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-gray-400 text-white text-[10px] font-bold rounded-full">
                    Désactivé
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-ink text-sm truncate">{item.product.name}</h3>
                <p className="text-xs text-gray-400 truncate mt-0.5">/boutique/{item.product.slug}</p>

                <div className="flex items-center gap-2 mt-3">
                  <Link
                    href={`/admin/textile/${item.id}`}
                    className="flex-1 text-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Modifier position
                  </Link>
                  <TextileActions id={item.id} isActive={item.is_active} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
