'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Product = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  price: number;
  sale_price: number | null;
  image: { url: string; alt: string | null } | null;
};

type Ville = {
  name: string;
  slug: string;
  count: number;
  products: Product[];
};

/* ── Extraction des villes depuis les noms de produits ──── */

const VILLE_PATTERNS = [
  // Communes principales
  'Saint-Denis', 'Saint-Pierre', 'Saint-Paul', 'Saint-Leu', 'Saint-Joseph',
  'Saint-Benoît', 'Saint-André', 'Saint-Philippe', 'Saint-Louis', 'Saint-Gilles',
  'Sainte-Marie', 'Sainte-Rose', 'Sainte-Suzanne', 'Sainte-Anne',
  // Cirques & intérieur
  'Cilaos', 'Salazie', 'Mafate',
  // Autres communes
  'Le Tampon', 'Le Port', 'La Possession', 'Entre-Deux', 'Petite-Île',
  'Les Avirons', 'Les Trois-Bassins', 'Étang-Salé',
  'Plaine des Palmistes', 'Bras Panon', 'Bras-Panon',
];

function extractVille(productName: string): string | null {
  const upper = productName.toUpperCase();
  for (const ville of VILLE_PATTERNS) {
    if (upper.includes(ville.toUpperCase())) {
      // Normaliser Bras-Panon / Bras Panon
      if (ville === 'Bras-Panon') return 'Bras Panon';
      return ville;
    }
  }
  return null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const CATEGORY_LABELS: Record<string, string> = {
  magnets: 'Magnet',
  stickers: 'Stickers',
  textile: 'Textile',
  goodies: 'Goodie',
  decoration: 'Déco',
};

/* ── Composant ───────────────────────────────────────────── */

export function VillesBlock({ products }: { products: Product[] }) {
  const [selectedVille, setSelectedVille] = useState<string | null>(null);

  // Grouper les produits par ville
  const villes = useMemo(() => {
    const map = new Map<string, Product[]>();

    for (const product of products) {
      const ville = extractVille(product.name);
      if (!ville) continue;
      const existing = map.get(ville) ?? [];
      existing.push(product);
      map.set(ville, existing);
    }

    // Trier par nombre de produits décroissant, puis alpha
    return Array.from(map.entries())
      .map(([name, prods]): Ville => ({
        name,
        slug: slugify(name),
        count: prods.length,
        products: prods,
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [products]);

  const selected = villes.find((v) => v.name === selectedVille);

  if (villes.length === 0) return null;

  return (
    <section className="relative py-16 md:py-24 bg-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Titre */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="title-chunky text-2xl md:text-4xl lg:text-5xl">
            NOUT ZÎL
          </h2>
          <p className="mt-3 text-ink/60 text-sm md:text-base italic max-w-xl mx-auto">
            Chaque commune a ses souvenirs. Retrouve ta ville.
          </p>
        </div>

        {/* Grille villes */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
          {villes.map((ville) => (
            <button
              key={ville.name}
              onClick={() =>
                setSelectedVille(
                  selectedVille === ville.name ? null : ville.name
                )
              }
              className={cn(
                'relative group flex flex-col items-center gap-1.5 p-3 md:p-4 rounded-xl transition-all duration-300',
                selectedVille === ville.name
                  ? 'bg-jungle-600 text-white shadow-lg scale-[1.02]'
                  : 'bg-white border border-gray-200 hover:border-jungle-400 hover:shadow-md'
              )}
            >
              <MapPin
                size={18}
                className={cn(
                  'transition-colors',
                  selectedVille === ville.name
                    ? 'text-sun-400'
                    : 'text-jungle-400 group-hover:text-jungle-600'
                )}
              />
              <span className="text-xs md:text-sm font-semibold text-center leading-tight">
                {ville.name}
              </span>
              <span
                className={cn(
                  'text-[10px] font-medium',
                  selectedVille === ville.name
                    ? 'text-white/70'
                    : 'text-gray-400'
                )}
              >
                {ville.count} produit{ville.count > 1 ? 's' : ''}
              </span>
            </button>
          ))}
        </div>

        {/* Panel produits de la ville sélectionnée */}
        {selected && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Header */}
            <div className="px-5 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-jungle-600" />
                <div>
                  <h3 className="font-bold text-ink">{selected.name}</h3>
                  <p className="text-xs text-gray-400">
                    {selected.count} produit{selected.count > 1 ? 's' : ''}{' '}
                    disponible{selected.count > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVille(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Produits */}
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {selected.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/boutique/${product.slug}`}
                    className="group flex flex-col"
                  >
                    <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-50 mb-2">
                      {product.image ? (
                        <Image
                          src={product.image.url}
                          alt={product.image.alt || product.name}
                          fill
                          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, 20vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                          Pas d&apos;image
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                      {CATEGORY_LABELS[product.category ?? ''] ?? product.category}
                    </p>
                    <p className="text-xs font-semibold text-ink group-hover:text-jungle-600 transition-colors leading-tight mt-0.5 line-clamp-2">
                      {product.name}
                    </p>
                    <p className="text-sm font-bold text-jungle-700 mt-1">
                      {(product.sale_price || product.price).toFixed(2)} €
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
