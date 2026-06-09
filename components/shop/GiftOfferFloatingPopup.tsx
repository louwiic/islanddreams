'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gift, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/lib/cart/CartProvider';

type GiftOffer = {
  enabled: boolean;
  minAmount?: number;
  title?: string;
  description?: string;
  product?: {
    name: string;
    slug: string;
    image: string | null;
    imageAlt: string | null;
  };
};

const STORAGE_KEY = 'id-gift-offer-floating-hidden';

export function GiftOfferFloatingPopup() {
  const pathname = usePathname();
  const { total } = useCart();
  const [offer, setOffer] = useState<GiftOffer | null>(null);
  const [hidden, setHidden] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem(STORAGE_KEY) === '1'
  );

  const shouldShowOnPage = pathname === '/boutique' || pathname.startsWith('/boutique/');

  useEffect(() => {
    if (!shouldShowOnPage) return;
    if (hidden) return;

    let cancelled = false;
    fetch('/api/gift-offer')
      .then((res) => res.json())
      .then((data: GiftOffer) => {
        if (!cancelled) setOffer(data);
      })
      .catch(() => {
        if (!cancelled) setOffer(null);
      });

    return () => {
      cancelled = true;
    };
  }, [hidden, shouldShowOnPage]);

  if (!shouldShowOnPage || hidden || !offer?.enabled || !offer.minAmount || !offer.product) {
    return null;
  }

  const remaining = Math.max(0, offer.minAmount - total);
  const unlocked = remaining === 0;
  const progress = Math.min(100, (total / offer.minAmount) * 100);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setHidden(true);
  };

  return (
    <aside className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-[90] mx-auto max-w-sm animate-in slide-in-from-bottom-4 duration-300 sm:left-4 sm:right-auto sm:mx-0 sm:max-w-[360px]">
      <div className="overflow-hidden rounded-2xl border border-sun-200 bg-white shadow-2xl shadow-black/15">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-ink/80 text-white transition-colors hover:bg-ink"
          aria-label="Masquer le cadeau offert"
        >
          <X size={15} />
        </button>

        <div className="flex gap-3 p-3 pr-10">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sun-50 ring-1 ring-sun-200">
            {offer.product.image ? (
              <Image
                src={offer.product.image}
                alt={offer.product.imageAlt || offer.product.name}
                fill
                className="object-contain p-1.5"
                sizes="64px"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-jungle-700">
                <Gift size={24} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-jungle-800">
              {unlocked ? 'Cadeau débloqué' : offer.title || 'Un cadeau vous attend'}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink/65">
              {unlocked
                ? `${offer.product.name} sera offert dans votre commande.`
                : `Encore ${remaining.toFixed(2)} € pour recevoir ${offer.product.name} offert.`}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-jungle-700 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <Link
          href={unlocked ? '/panier' : '/boutique'}
          className="flex items-center justify-center gap-2 bg-jungle-800 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-cream transition-colors hover:bg-jungle-900"
        >
          <ShoppingBag size={14} />
          {unlocked ? 'Voir mon panier' : 'Continuer mes achats'}
        </Link>
      </div>
    </aside>
  );
}
