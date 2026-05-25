'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Play, Volume2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DemoVideoConfig = {
  enabled: boolean;
  videoUrl: string;
  posterUrl?: string;
  productSlug: string;
  title: string;
  position: 'bottom-right' | 'bottom-left';
};

type Props = {
  config: DemoVideoConfig | null;
};

export function DemoVideoWidget({ config }: Props) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!config?.enabled || !config.videoUrl || !config.productSlug || hidden) return null;

  const productHref = `/boutique/${config.productSlug}`;
  const isLeft = config.position === 'bottom-left';

  return (
    <>
      <div
        className={cn(
          'fixed bottom-5 z-40 w-28 sm:w-32 rounded-2xl bg-black shadow-2xl shadow-black/25 overflow-hidden ring-1 ring-white/40',
          isLeft ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
        )}
      >
        <button
          type="button"
          onClick={() => setHidden(true)}
          className="absolute right-1.5 top-1.5 z-10 rounded-full bg-black/55 p-1 text-white hover:bg-black/75"
          aria-label="Masquer la vidéo"
        >
          <X size={14} />
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group block w-full text-left"
          aria-label="Ouvrir la vidéo démo"
        >
          <div className="relative aspect-[9/16] bg-black">
            <video
              src={config.videoUrl}
              poster={config.posterUrl}
              muted
              loop
              playsInline
              autoPlay
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />
            <span className="absolute inset-x-0 bottom-8 flex justify-center">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-lg transition-transform group-hover:scale-105">
                <Play size={16} fill="currentColor" />
              </span>
            </span>
            <span className="absolute inset-x-2 bottom-2 line-clamp-2 text-center text-[11px] font-bold leading-tight text-white">
              {config.title}
            </span>
          </div>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 px-4 py-6 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Vidéo démo produit"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={() => setOpen(false)}
            aria-label="Fermer la vidéo"
          />
          <div className="relative z-10 flex max-h-full w-full max-w-[430px] flex-col items-center">
            <div className="relative max-h-[calc(100svh-7rem)] w-full overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/15">
              <video
                src={config.videoUrl}
                poster={config.posterUrl}
                controls
                autoPlay
                playsInline
                className="aspect-[9/16] max-h-[calc(100svh-7rem)] w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 rounded-full bg-black/55 p-2 text-white hover:bg-black/75"
                aria-label="Fermer la vidéo"
              >
                <X size={22} />
              </button>
              <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/45 p-2 text-white">
                <Volume2 size={18} />
              </div>
              <div className="absolute inset-x-4 bottom-4 rounded-xl bg-white/92 p-3 shadow-lg backdrop-blur">
                <p className="line-clamp-2 text-sm font-bold leading-tight text-ink">{config.title}</p>
                <Link
                  href={productHref}
                  className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-jungle-700 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-cream hover:bg-jungle-800"
                >
                  Voir le produit
                  <ExternalLink size={15} />
                </Link>
              </div>
            </div>
            <p className="mt-3 text-xs text-white/70">Fermez la vidéo pour revenir à la boutique.</p>
          </div>
        </div>
      )}
    </>
  );
}
