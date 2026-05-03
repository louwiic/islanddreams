import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ChevronRight } from 'lucide-react';
import { getPublishedProducts } from '@/lib/queries/products';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Boutique — Island Dreams | Souvenirs de La Réunion',
  description:
    'Découvrez notre collection de souvenirs illustrés de La Réunion : magnets, stickers, textile, décoration. Dessinés et imprimés à La Réunion.',
  alternates: { canonical: '/boutique' },
  openGraph: {
    title: 'Boutique — Island Dreams',
    description: 'Magnets, stickers, textile, décoration — tous nos souvenirs illustrés de La Réunion.',
    locale: 'fr_RE',
    type: 'website',
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  magnets: 'Magnets',
  stickers: 'Stickers',
  textile: 'Textile',
  goodies: 'Goodies',
  decoration: 'Décoration',
};

const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'name', label: 'Nom A-Z' },
];

type Props = {
  searchParams: Promise<{ categorie?: string; tri?: string; q?: string }>;
};

export default async function BoutiquePage({ searchParams }: Props) {
  const params = await searchParams;
  const allProducts = await getPublishedProducts();

  const activeCategory = params.categorie || 'tous';
  const sort = params.tri || 'recent';
  const query = params.q?.toLowerCase().trim() || '';

  // Filtrer
  let filtered = allProducts;

  if (activeCategory !== 'tous') {
    filtered = filtered.filter((p) => p.category === activeCategory);
  }

  if (query) {
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(query)
    );
  }

  // Trier
  filtered = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return (a.sale_price || a.price) - (b.sale_price || b.price);
      case 'price-desc':
        return (b.sale_price || b.price) - (a.sale_price || a.price);
      case 'name':
        return a.name.localeCompare(b.name, 'fr');
      default:
        return 0;
    }
  });

  // Catégories uniques
  const categories = Array.from(
    new Set(allProducts.map((p) => p.category).filter(Boolean))
  ) as string[];

  function buildHref(overrides: Record<string, string | undefined>) {
    const merged = { categorie: activeCategory, tri: sort, q: query || undefined, ...overrides };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== 'tous' && v !== 'recent' && v !== '') sp.set(k, v);
    }
    const qs = sp.toString();
    return `/boutique${qs ? `?${qs}` : ''}`;
  }

  return (
    <main>
      {/* Espace pour la navbar fixe */}
      <div className="bg-jungle-800 pt-24 pb-4" />

      <div className="pb-16 px-4 pt-6 bg-cream">
        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto flex items-center gap-2 text-sm mb-6">
          <Link href="/" className="text-ink/40 hover:text-ink transition-colors">
            Accueil
          </Link>
          <ChevronRight size={14} className="text-ink/25" />
          <span className="text-ink font-medium">Boutique</span>
        </nav>
      <div className="max-w-7xl mx-auto">
        <h1 className="title-chunky text-3xl md:text-5xl text-center mb-8">
          NOUT BOUTIK
        </h1>

        {/* Barre filtres */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          {/* Recherche */}
          <form action="/boutique" className="relative w-full md:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Rechercher un produit..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 bg-white"
            />
            {activeCategory !== 'tous' && (
              <input type="hidden" name="categorie" value={activeCategory} />
            )}
            {sort !== 'recent' && (
              <input type="hidden" name="tri" value={sort} />
            )}
          </form>

          {/* Tri */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Trier :</span>
            <div className="flex gap-1">
              {SORT_OPTIONS.map((opt) => (
                <Link
                  key={opt.value}
                  href={buildHref({ tri: opt.value })}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                    sort === opt.value
                      ? 'bg-ink text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Catégories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          <Link
            href={buildHref({ categorie: 'tous' })}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors',
              activeCategory === 'tous'
                ? 'bg-jungle-700 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            )}
          >
            Tout ({allProducts.length})
          </Link>
          {categories.map((cat) => {
            const count = allProducts.filter((p) => p.category === cat).length;
            return (
              <Link
                key={cat}
                href={buildHref({ categorie: cat })}
                className={cn(
                  'px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors',
                  activeCategory === cat
                    ? 'bg-jungle-700 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                {CATEGORY_LABELS[cat] ?? cat} ({count})
              </Link>
            );
          })}
        </div>

        {/* Résultats */}
        {query && (
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''} pour &quot;{query}&quot;
            {activeCategory !== 'tous' && ` dans ${CATEGORY_LABELS[activeCategory] ?? activeCategory}`}
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">
              Aucun produit trouvé.
            </p>
            <Link
              href="/boutique"
              className="mt-4 inline-block text-sm text-jungle-600 hover:underline"
            >
              Voir tous les produits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((product) => (
              <Link
                key={product.id}
                href={`/boutique/${product.slug}`}
                className="group"
              >
                <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-100 mb-3">
                  {product.image ? (
                    <Image
                      src={product.image.url}
                      alt={product.image.alt || product.name}
                      fill
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmN2YxIi8+PC9zdmc+"
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      Pas d&apos;image
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  {CATEGORY_LABELS[product.category ?? ''] ?? product.category}
                </p>
                <h2 className="text-sm font-semibold text-ink group-hover:text-jungle-600 transition-colors mt-0.5 leading-tight">
                  {product.name}
                </h2>
                <div className="mt-1 flex items-center gap-2">
                  {product.sale_price ? (
                    <>
                      <span className="text-coral-500 font-bold">
                        {product.sale_price.toFixed(2)} €
                      </span>
                      <span className="text-gray-400 line-through text-xs">
                        {product.price.toFixed(2)} €
                      </span>
                    </>
                  ) : (
                    <span className="text-jungle-700 font-bold">
                      {product.price.toFixed(2)} €
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      </div>
    </main>
  );
}
