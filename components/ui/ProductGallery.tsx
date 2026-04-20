'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type GalleryImage = {
  id: string;
  url: string;
  alt: string | null;
  is_main: boolean | null;
};

export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const current = images[activeIndex];

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((index + images.length) % images.length);
    },
    [images.length]
  );

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-sm">Pas d&apos;image</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Image principale */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
          <Image
            src={current.url}
            alt={current.alt || productName}
            fill
            className="object-contain p-6"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />

          {/* Bouton zoom */}
          <button
            onClick={() => setZoomed(true)}
            className="absolute top-3 right-3 p-2 rounded-lg bg-white/80 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            aria-label="Zoomer"
          >
            <ZoomIn size={18} />
          </button>

          {/* Flèches si plusieurs images */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => goTo(activeIndex - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                aria-label="Image précédente"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => goTo(activeIndex + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                aria-label="Image suivante"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Compteur */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/50 text-white text-xs font-medium md:hidden">
              {activeIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Vignettes */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden relative border-2 transition-all',
                  activeIndex === i
                    ? 'border-jungle-600 ring-1 ring-jungle-600/30'
                    : 'border-transparent hover:border-gray-300 opacity-60 hover:opacity-100'
                )}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `${productName} - ${i + 1}`}
                  fill
                  className="object-contain p-1"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox zoom */}
      {zoomed && (
        <div
          className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center"
          onClick={() => setZoomed(false)}
        >
          {/* Fermer */}
          <button
            onClick={() => setZoomed(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Fermer"
          >
            <X size={24} />
          </button>

          {/* Flèches */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(activeIndex - 1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Image précédente"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(activeIndex + 1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Image suivante"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Image zoomée */}
          <div
            className="relative w-[90vw] h-[90vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={current.url}
              alt={current.alt || productName}
              fill
              className="object-contain"
              sizes="90vw"
              quality={100}
            />
          </div>

          {/* Compteur */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium">
              {activeIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
