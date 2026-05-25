'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ExternalLink, Play, ShoppingBag, Volume2, X } from 'lucide-react';
import { useCart } from '@/lib/cart/CartProvider';
import type { CartItem } from '@/lib/cart/types';
import { cn } from '@/lib/utils';

export type DemoVideoConfig = {
  enabled: boolean;
  videoUrl: string;
  posterUrl?: string;
  productSlug: string;
  title: string;
  position: 'bottom-right' | 'bottom-left';
  product?: {
    id: string;
    slug: string;
    name: string;
    price: number;
    salePrice: number | null;
    image: string | null;
    imageAlt: string | null;
    inStock: boolean;
    weightGrams: number | null;
    manageStock: boolean | null;
    stockQuantity: number | null;
  };
};

type Props = {
  config: DemoVideoConfig | null;
};

export function DemoVideoWidget({ config }: Props) {
  const { addItem } = useCart();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [added, setAdded] = useState(false);
  const [portalTarget] = useState(() =>
    typeof document === 'undefined' ? null : document.body
  );

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

  if (!portalTarget || !config?.enabled || !config.videoUrl || !config.productSlug || hidden) return null;

  const productHref = `/boutique/${config.productSlug}`;
  const isLeft = config.position === 'bottom-left';
  const product = config.product;
  const productPrice = product ? product.salePrice || product.price : null;

  const handleAddToCart = () => {
    if (!product || !product.inStock || productPrice == null) return;

    const item: CartItem = {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: productPrice,
      quantity: 1,
      image: product.image ?? undefined,
      weightGrams: product.weightGrams ?? undefined,
      maxQuantity:
        product.manageStock && product.stockQuantity != null
          ? product.stockQuantity
          : undefined,
    };

    addItem(item);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return createPortal(
    <>
      <div
        style={{
          bottom: 'max(0.875rem, env(safe-area-inset-bottom))',
          maxWidth: 'calc(100vw - 1.5rem)',
          ...(isLeft
            ? { left: 'max(0.75rem, env(safe-area-inset-left))' }
            : { right: 'max(0.75rem, env(safe-area-inset-right))' }),
        }}
        className={cn(
          'fixed z-[2147483000] w-24 overflow-visible rounded-2xl bg-black shadow-2xl shadow-black/25 sm:w-32'
        )}
      >
        <button
          type="button"
          onClick={() => setHidden(true)}
          className="absolute -right-2 -top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-white/80 bg-black/80 p-0 leading-none text-white shadow-lg hover:bg-black"
          aria-label="Masquer la vidéo"
        >
          <X size={14} strokeWidth={3} className="block" />
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group block w-full overflow-hidden rounded-2xl text-left ring-1 ring-white/40"
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
          className="fixed inset-0 z-[2147483001] flex items-center justify-center bg-black/82 px-4 py-6 backdrop-blur-[2px]"
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
            <div className="relative max-h-[calc(100svh-6rem)] w-full overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/15">
              <video
                src={config.videoUrl}
                poster={config.posterUrl}
                controls
                autoPlay
                playsInline
                className="aspect-[9/16] max-h-[calc(100svh-6rem)] w-full object-cover"
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
              {product ? (
                <div className="absolute inset-x-4 bottom-4 overflow-hidden rounded-xl bg-white/90 shadow-lg backdrop-blur">
                  <div className="flex items-center gap-3 p-3">
                    <Link
                      href={productHref}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cream ring-1 ring-black/5"
                    >
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.imageAlt || product.name}
                          fill
                          className="object-contain p-1.5"
                          sizes="64px"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-100" />
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={productHref} className="group flex items-start gap-1">
                        <span className="line-clamp-2 text-sm font-bold leading-tight text-ink group-hover:text-jungle-700">
                          {product.name}
                        </span>
                        <ExternalLink size={14} className="mt-0.5 shrink-0 text-ink/45" />
                      </Link>
                      {productPrice != null && (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-ink shadow-sm">
                            {productPrice.toFixed(2)} €
                          </span>
                          {product.salePrice && (
                            <span className="text-xs text-ink/45 line-through">
                              {product.price.toFixed(2)} €
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={cn(
                      'flex w-full items-center justify-center gap-2 bg-jungle-800 px-4 py-3 text-sm font-black uppercase tracking-wider text-cream transition-colors',
                      product.inStock
                        ? added
                          ? 'bg-jungle-600'
                          : 'hover:bg-jungle-900'
                        : 'cursor-not-allowed bg-gray-400'
                    )}
                  >
                    {added ? <Check size={17} /> : <ShoppingBag size={17} />}
                    {product.inStock ? (added ? 'Ajouté' : 'Ajouter au panier') : 'Rupture de stock'}
                  </button>
                </div>
              ) : (
                <Link
                  href={productHref}
                  className="absolute inset-x-4 bottom-4 flex items-center justify-center gap-2 rounded-xl bg-jungle-800 px-4 py-3 text-sm font-black uppercase tracking-wider text-cream shadow-lg hover:bg-jungle-900"
                >
                  Voir le produit
                  <ExternalLink size={15} />
                </Link>
              )}
            </div>
            <p className="mt-3 text-xs text-white/70">Fermez la vidéo pour revenir à la boutique.</p>
          </div>
        </div>
      )}
    </>,
    portalTarget
  );
}
