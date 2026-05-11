'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Check } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  image_url: string | null;
};

export function TextileProductSelector({ products }: { products: Product[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!selected) return;
    setSaving(true);

    await fetch('/api/admin/textile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: selected }),
    });

    setSaving(false);
    router.push('/admin/textile');
    router.refresh();
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Recherche */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500"
        />
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Aucun produit disponible</p>
        ) : (
          filtered.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => setSelected(product.id === selected ? null : product.id)}
              className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors ${
                selected === product.id ? 'bg-jungle-50' : ''
              }`}
            >
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{product.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">{product.category}</p>
              </div>

              {/* Check */}
              {selected === product.id && (
                <div className="w-6 h-6 rounded-full bg-jungle-500 flex items-center justify-center shrink-0">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </button>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selected || saving}
          className="px-5 py-2.5 bg-jungle-600 hover:bg-jungle-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Ajout...' : 'Ajouter au carousel'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/textile')}
          className="px-4 py-2.5 text-sm text-gray-500 hover:text-ink transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
