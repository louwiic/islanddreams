'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

type ProductImage = { id: string; url: string; is_main: boolean; alt: string | null };
type Product = { id: string; name: string; slug: string; images: ProductImage[] };

export function TextileProductSelector({ products }: { products: Product[] }) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const product = products.find((p) => p.id === selectedProduct) ?? null;

  const handleSelectProduct = (id: string) => {
    const p = products.find((pr) => pr.id === id);
    setSelectedProduct(id);
    // Auto-sélectionner l'image principale
    const main = p?.images.find((i) => i.is_main) ?? p?.images[0] ?? null;
    setSelectedImageUrl(main?.url ?? null);
  };

  const handleAdd = async () => {
    if (!selectedProduct) return;
    setSaving(true);
    await fetch('/api/admin/textile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: selectedProduct, image_url: selectedImageUrl }),
    });
    setSaving(false);
    router.push('/admin/textile');
    router.refresh();
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500 text-sm">Tous les produits textile sont déjà dans le carousel.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">

      {/* Étape 1 — Choisir le produit */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">1 · Produit</p>
        </div>
        <div className="divide-y divide-gray-50">
          {products.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectProduct(p.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                selectedProduct === p.id ? 'bg-jungle-50' : ''
              }`}
            >
              {/* Thumbnail image principale */}
              <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {p.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{p.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.images.length} photo{p.images.length > 1 ? 's' : ''}</p>
              </div>
              {selectedProduct === p.id && (
                <div className="w-5 h-5 rounded-full bg-jungle-500 flex items-center justify-center shrink-0">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Étape 2 — Choisir la photo (si plusieurs) */}
      {product && product.images.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">2 · Photo à afficher</p>
          </div>
          <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {product.images.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedImageUrl(img.url)}
                className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedImageUrl === img.url
                    ? 'border-jungle-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt ?? ''} className="w-full h-full object-cover" />
                {selectedImageUrl === img.url && (
                  <div className="absolute inset-0 bg-jungle-500/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-jungle-500 flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  </div>
                )}
                {img.is_main && (
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-ink/70 text-white text-[9px] font-bold rounded">
                    Principale
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selectedProduct || saving}
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
