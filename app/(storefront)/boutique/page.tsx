import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ChevronRight } from 'lucide-react';
import { getPublishedProducts } from '@/lib/queries/products';
import { cn } from '@/lib/utils';
import { createAdminClient } from '@/lib/supabase/admin';
import { TranslatedText } from '@/components/i18n/TranslatedText';
import { TranslatedInput } from '@/components/i18n/TranslatedInput';

export const metadata: Metadata = {
  title: 'Boutique — Cadeaux personnalisés Réunion 974 | Island Dreams',
  description:
    'Découvrez notre collection de cadeaux personnalisés et souvenirs illustrés de La Réunion 974 : magnets, stickers, textile et décoration dessinés et imprimés à La Réunion.',
  keywords: [
    'cadeau personnalisé reunion',
    'cadeau personnalisé 974',
    'cadeaux personnalisés La Réunion',
    'souvenirs Réunion',
    'boutique souvenirs 974',
    'magnets Réunion',
    'stickers 974',
  ],
  alternates: { canonical: '/boutique' },
  openGraph: {
    title: 'Boutique — Cadeaux personnalisés Réunion 974 | Island Dreams',
    description:
      'Magnets, stickers, textile, décoration — des cadeaux personnalisés et souvenirs illustrés de La Réunion 974.',
    locale: 'fr_FR',
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
  { value: 'recent', label: 'shop.sortRecent' as const },
  { value: 'price-asc', label: 'shop.sortPriceAsc' as const },
  { value: 'price-desc', label: 'shop.sortPriceDesc' as const },
  { value: 'name', label: 'shop.sortName' as const },
];

type Props = {
  searchParams: Promise<{ categorie?: string; evenement?: string; tri?: string; q?: string }>;
};

type EventCollection = {
  slug: string;
  title: string;
};

function eventSlugFromLink(link: string | null) {
  if (!link) return '';
  const hashMatch = link.match(/^#evenement-special:([^/?#]+)/);
  if (hashMatch) return hashMatch[1];
  const queryMatch = link.match(/[?&]evenement=([^&#]+)/);
  return queryMatch?.[1] ?? '';
}

async function getActiveEventCollection(): Promise<EventCollection | null> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from('hero_banners' as never)
    .select('title, cta_link')
    .eq('is_active', true)
    .lte('start_date', today)
    .gte('end_date', today)
    .order('priority', { ascending: false })
    .limit(1);

  if (!data || data.length === 0) return null;
  const banner = data[0] as unknown as { title: string; cta_link: string | null };
  const slug = eventSlugFromLink(banner.cta_link);
  if (!slug) return null;
  return { slug, title: banner.title };
}

export default async function BoutiquePage({ searchParams }: Props) {
  const params = await searchParams;
  const [allProducts, eventCollection] = await Promise.all([
    getPublishedProducts(),
    getActiveEventCollection(),
  ]);

  const activeCategory = params.categorie || 'tous';
  const activeEvent = params.evenement || '';
  const sort = params.tri || 'recent';
  const query = params.q?.toLowerCase().trim() || '';

  // Filtrer
  let filtered = allProducts;

  if (activeEvent) {
    filtered = filtered.filter((p) => p.tags?.includes(`event:${activeEvent}`));
  } else if (activeCategory !== 'tous') {
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
    const merged = {
      categorie: activeEvent ? undefined : activeCategory,
      evenement: activeEvent || undefined,
      tri: sort,
      q: query || undefined,
      ...overrides,
    };
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
            <TranslatedText id="nav.home" />
          </Link>
          <ChevronRight size={14} className="text-ink/25" />
          <span className="text-ink font-medium"><TranslatedText id="shop.title" /></span>
        </nav>
      <div className="max-w-7xl mx-auto">
        <h1 className="title-chunky text-3xl md:text-5xl text-center mb-8">
          <TranslatedText id="home.products.title" />
        </h1>

        {/* Barre filtres */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          {/* Recherche */}
          <form action="/boutique" className="relative w-full md:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <TranslatedInput
              type="text"
              name="q"
              defaultValue={query}
              placeholderId="shop.search"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 bg-white"
            />
            {activeCategory !== 'tous' && (
              <input type="hidden" name="categorie" value={activeCategory} />
            )}
            {sort !== 'recent' && (
              <input type="hidden" name="tri" value={sort} />
            )}
            {activeEvent && (
              <input type="hidden" name="evenement" value={activeEvent} />
            )}
          </form>

          {/* Tri */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500"><TranslatedText id="shop.sort" /></span>
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
                  <TranslatedText id={opt.label} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Catégories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          <Link
            href={buildHref({ categorie: 'tous', evenement: undefined })}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors',
              activeCategory === 'tous' && !activeEvent
                ? 'bg-jungle-700 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            )}
          >
            <TranslatedText id="home.products.all" /> ({allProducts.length})
          </Link>
          {eventCollection && (
            <Link
              href={buildHref({ categorie: undefined, evenement: eventCollection.slug })}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors',
                activeEvent === eventCollection.slug
                  ? 'bg-coral-600 text-white'
                  : 'bg-white border border-coral-200 text-coral-600 hover:bg-coral-50'
              )}
            >
              {eventCollection.title} (
              {allProducts.filter((p) => p.tags?.includes(`event:${eventCollection.slug}`)).length}
              )
            </Link>
          )}
          {categories.map((cat) => {
            const count = allProducts.filter((p) => p.category === cat).length;
            return (
              <Link
                key={cat}
                href={buildHref({ categorie: cat, evenement: undefined })}
                className={cn(
                  'px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors',
                  activeCategory === cat && !activeEvent
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
            <TranslatedText id="shop.results" values={{ count: filtered.length, query }} />
            {activeEvent
              ? ` dans ${eventCollection?.title ?? activeEvent}`
              : activeCategory !== 'tous' && ` dans ${CATEGORY_LABELS[activeCategory] ?? activeCategory}`}
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">
              <TranslatedText id="shop.empty" />
            </p>
            <Link
              href="/boutique"
              className="mt-4 inline-block text-sm text-jungle-600 hover:underline"
            >
              <TranslatedText id="shop.all" />
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
