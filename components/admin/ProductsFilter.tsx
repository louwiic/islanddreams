'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Search } from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'Tous' },
  { value: 'magnets', label: 'Magnets' },
  { value: 'stickers', label: 'Stickers' },
  { value: 'textile', label: 'Textile' },
  { value: 'goodies', label: 'Goodies' },
  { value: 'decoration', label: 'Décoration' },
  { value: 'uncategorized', label: 'Non classé' },
];

export function ProductsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeCategory = searchParams.get('category') ?? '';
  const activeSearch = searchParams.get('q') ?? '';

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
      {/* Recherche */}
      <div className="relative flex-1 sm:w-64">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          defaultValue={activeSearch}
          placeholder="Rechercher..."
          onChange={(e) => updateParams('q', e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 bg-white"
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-jungle-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Filtres catégorie */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => updateParams('category', cat.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeCategory === cat.value
                ? 'bg-jungle-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
