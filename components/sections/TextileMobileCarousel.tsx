'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type TextileItem = {
  id: string;
  product_name: string;
  image_url: string;
  product_link: string;
};

export function TextileMobileCarousel({ items }: { items: TextileItem[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative w-full px-10">
      {/* Flèche gauche */}
      <button
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center bg-white/90 rounded-full shadow-md"
        aria-label="Précédent"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

      {/* Viewport */}
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex">
          {items.map((item) => (
            <div key={item.id} className="flex-[0_0_100%] min-w-0 flex flex-col items-center gap-3 pb-2">
              <div className="rounded-2xl overflow-hidden shadow-xl bg-white w-full">
                <Image
                  src={item.image_url}
                  alt={item.product_name}
                  width={800}
                  height={800}
                  className="w-full h-auto"
                />
              </div>
              <Link
                href={item.product_link}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-sun-400 hover:bg-sun-300 text-ink text-xs font-bold uppercase tracking-wider rounded-full shadow transition-colors"
              >
                Découvrir
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Flèche droite */}
      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center bg-white/90 rounded-full shadow-md"
        aria-label="Suivant"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
  );
}
