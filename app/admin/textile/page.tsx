import { createAdminClient } from '@/lib/supabase/admin';
import { Plus, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { TextileActions } from './TextileActions';

type TextileItem = {
  id: string;
  product_name: string;
  image_url: string;
  product_link: string;
  position: number;
  is_active: boolean;
};

async function getTextileItems() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('textile_highlights' as never)
    .select('*')
    .order('position', { ascending: true });
  return (data ?? []) as unknown as TextileItem[];
}

export default async function TextileAdminPage() {
  const items = await getTextileItems();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">Carousel Textile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les produits mis en avant dans le bloc plage
          </p>
        </div>
        <Link
          href="/admin/textile/nouveau"
          className="inline-flex items-center gap-2 px-4 py-2 bg-jungle-600 hover:bg-jungle-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Ajouter un produit
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <ImageIcon size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Aucun produit textile configuré</p>
          <p className="text-gray-400 text-sm mt-1">Les images statiques seront utilisées par défaut</p>
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
              <div className="aspect-square bg-gray-50 relative">
                <img
                  src={item.image_url}
                  alt={item.product_name}
                  className="w-full h-full object-cover"
                />
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
                <h3 className="font-semibold text-ink text-sm truncate">{item.product_name}</h3>
                <p className="text-xs text-gray-400 truncate mt-0.5">{item.product_link}</p>

                <div className="flex items-center gap-2 mt-3">
                  <Link
                    href={`/admin/textile/${item.id}`}
                    className="flex-1 text-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Modifier
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
