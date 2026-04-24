'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  sale_price: number | null;
  image: { url: string; alt: string | null } | null;
};

export function TextileCarousel({ products }: { products: Product[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!products.length) return null;

  return (
    <div className="relative w-full">
      {/* Flèche gauche */}
      <button
        onClick={scrollPrev}
        className="absolute left-0 md:-left-2 top-1/2 -translate-y-1/2 z-20 hover:scale-110 transition-transform"
        aria-label="Précédent"
      >
        <Image src="/images/ui/arrow.svg" alt="" width={50} height={60}
          className="w-8 h-10 md:w-12 md:h-14 -scale-x-100 opacity-70 hover:opacity-100 transition-opacity" />
      </button>

      {/* Viewport */}
      <div className="overflow-hidden mx-10 md:mx-16" ref={emblaRef}>
        <div className="flex">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-[0_0_75%] md:flex-[0_0_32%] lg:flex-[0_0_30%] min-w-0 px-2 md:px-3"
            >
              <Link href={`/boutique/${product.slug}`} className="flex flex-col items-center group">
                {/* Image */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-cream/80">
                  {product.image ? (
                    <Image
                      src={product.image.url}
                      alt={product.image.alt || product.name}
                      fill
                      className="object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 75vw, 30vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-cream/60 flex items-center justify-center">
                      <span className="text-ink/30 text-xs">Photo</span>
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="mt-3 text-center w-full">
                  <h3 className="font-bold text-cream text-sm md:text-base leading-tight line-clamp-2 drop-shadow">
                    {product.name}
                  </h3>
                  <p className="mt-1 font-black text-sun-400 text-base md:text-lg drop-shadow">
                    {(product.sale_price ?? product.price).toFixed(2)} €
                  </p>
                  <span className="mt-2 inline-block px-4 py-1.5 bg-jungle-700 hover:bg-jungle-800 text-cream text-xs font-bold uppercase tracking-wider rounded-full transition-colors">
                    Découvrir
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Flèche droite */}
      <button
        onClick={scrollNext}
        className="absolute right-0 md:-right-2 top-1/2 -translate-y-1/2 z-20 hover:scale-110 transition-transform"
        aria-label="Suivant"
      >
        <Image src="/images/ui/arrow.svg" alt="" width={50} height={60}
          className="w-8 h-10 md:w-12 md:h-14 opacity-70 hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
}
