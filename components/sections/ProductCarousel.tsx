'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';

const CATEGORY_LABELS: Record<string, string> = {
  magnets: 'Magnets',
  stickers: 'Stickers',
  textile: 'Textile',
  goodies: 'Goodies',
  decoration: 'Décoration',
  uncategorized: 'Tout',
};

export type CarouselProduct = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  price: number;
  sale_price: number | null;
  image: { url: string; alt: string | null } | null;
};

export function ProductCarousel({ products }: { products: CarouselProduct[] }) {
  // Extraire les catégories uniques depuis les vrais produits
  const availableCategories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category ?? 'uncategorized'));
    return ['Tout', ...Array.from(cats).map((c) => CATEGORY_LABELS[c] ?? c)];
  }, [products]);

  const [activeCategory, setActiveCategory] = useState<string>('Tout');
  const [selectedVille, setSelectedVille] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (selectedVille) {
      const upper = selectedVille.toUpperCase();
      return products.filter((p) => p.name.toUpperCase().includes(upper));
    }
    if (activeCategory === 'Tout') return products;
    return products.filter(
      (p) => CATEGORY_LABELS[p.category ?? 'uncategorized'] === activeCategory
    );
  }, [activeCategory, selectedVille, products]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    setSelectedIndex(0);
  }, [activeCategory, selectedVille, emblaApi]);

  useEffect(() => {
    const handler = (e: Event) => {
      const cat = (e as CustomEvent).detail;
      if (cat) {
        setSelectedVille(null);
        setActiveCategory(cat);
      }
    };
    const villeHandler = (e: Event) => {
      const ville = (e as CustomEvent).detail;
      if (ville) {
        setActiveCategory('');
        setSelectedVille(ville);
      }
    };
    window.addEventListener('select-category', handler);
    window.addEventListener('select-ville', villeHandler);
    return () => {
      window.removeEventListener('select-category', handler);
      window.removeEventListener('select-ville', villeHandler);
    };
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  if (products.length === 0) return null;

  return (
    <section
      id="product-carousel"
      className="relative w-full min-h-[100svh] flex flex-col justify-center overflow-hidden py-8 md:py-12"
    >
      <div className="absolute inset-0 bg-cream" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
        {/* Titre */}
        <div className="text-center mb-4 md:mb-6">
          <h2 className="title-chunky text-2xl md:text-4xl lg:text-6xl">
            {selectedVille ? `LES SOUVENIRS DE ${selectedVille.toUpperCase()}` : 'NOUT BOUTIK'}
          </h2>
          <p className="mt-2 text-ink/70 text-xs md:text-base italic max-w-2xl mx-auto">
            Des souvenirs pensés, dessinés et imprimés à La Réunion.
          </p>
        </div>

        {/* Onglets catégories */}
        <nav className="flex justify-center items-center gap-2 md:gap-6 mb-4 md:mb-6 flex-wrap">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedVille(null);
                setActiveCategory(cat);
              }}
              className={`px-3 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                activeCategory === cat && !selectedVille
                  ? 'text-jungle-800 border-b-2 border-jungle-800'
                  : 'text-ink/50 hover:text-ink border-b-2 border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}

          {/* Onglet dynamique — apparaît quand une commune est cliquée */}
          {selectedVille && (
            <button
              className="px-3 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-bold uppercase tracking-[0.15em] text-coral-600 border-b-2 border-coral-500 animate-in fade-in duration-300 flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-coral-500" />
              {selectedVille}
            </button>
          )}
        </nav>

        {/* Carousel Embla */}
        <div className="relative">
          {/* Flèche gauche */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 md:-left-2 top-1/2 -translate-y-1/2 z-20 hover:scale-110 transition-transform"
            aria-label="Produit précédent"
          >
            <Image
              src="/images/ui/arrow.svg"
              alt=""
              width={50}
              height={60}
              className="w-8 h-10 md:w-12 md:h-14 -scale-x-100 opacity-70 hover:opacity-100 transition-opacity"
            />
          </button>

          {/* Viewport */}
          <div className="overflow-hidden mx-12 md:mx-20" ref={emblaRef}>
            <div className="flex">
              {filtered.map((product) => (
                <div
                  key={product.id}
                  className="flex-[0_0_80%] md:flex-[0_0_33%] lg:flex-[0_0_28%] min-w-0 px-2 md:px-3"
                >
                  <Link
                    href={`/boutique/${product.slug}`}
                    className="flex flex-col items-center group"
                  >
                    {/* Image produit */}
                    <div className="relative aspect-square w-full">
                      {product.image ? (
                        <Image
                          src={product.image.url}
                          alt={product.image.alt || product.name}
                          fill
                          loading="eager"
                          placeholder="blur"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmN2YxIi8+PC9zdmc+"
                          className="object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 80vw, 28vw"
                        />
                      ) : (
                        <div className="w-full h-full rounded-xl bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">
                            Pas d&apos;image
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Nom */}
                    <h3 className="mt-3 font-bold text-ink text-sm md:text-base text-center leading-tight group-hover:text-jungle-700 transition-colors">
                      {product.name}
                    </h3>

                    {/* Prix */}
                    <div className="mt-1 flex items-center gap-2">
                      {product.sale_price ? (
                        <>
                          <span className="text-coral-500 font-black text-lg md:text-xl">
                            {product.sale_price.toFixed(2)} €
                          </span>
                          <span className="text-gray-400 line-through text-sm">
                            {product.price.toFixed(2)} €
                          </span>
                        </>
                      ) : (
                        <span className="text-jungle-700 font-black text-lg md:text-xl">
                          {product.price.toFixed(2)} €
                        </span>
                      )}
                    </div>

                    {/* Bouton */}
                    <span className="mt-2 px-4 py-2 md:px-5 md:py-2.5 bg-jungle-700 group-hover:bg-jungle-800 text-cream text-xs md:text-sm font-bold uppercase tracking-wider rounded-full transition-colors">
                      Découvrir
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Flèche droite */}
          <button
            onClick={scrollNext}
            className="absolute right-0 md:-right-2 top-1/2 -translate-y-1/2 z-20 hover:scale-110 transition-transform"
            aria-label="Produit suivant"
          >
            <Image
              src="/images/ui/arrow.svg"
              alt=""
              width={50}
              height={60}
              className="w-8 h-10 md:w-12 md:h-14 opacity-70 hover:opacity-100 transition-opacity"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
