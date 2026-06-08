import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Gift } from 'lucide-react';

export type GiftOfferBannerConfig = {
  title: string;
  description: string;
  minAmount: number;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  imageAlt: string | null;
};

export function GiftOfferBanner({ config }: { config: GiftOfferBannerConfig | null }) {
  if (!config) return null;

  return (
    <section className="relative z-10 bg-cream px-4 py-4">
      <Link
        href="/boutique"
        className="mx-auto flex max-w-5xl items-center gap-4 overflow-hidden rounded-2xl border border-sun-300/70 bg-gradient-to-r from-sun-300 via-cream to-jungle-100 px-4 py-3 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-lg sm:px-5"
      >
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-jungle-800 text-cream shadow-md">
          <Gift size={22} />
        </div>

        {config.imageUrl && (
          <div className="relative hidden h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-black/5 sm:block">
            <Image
              src={config.imageUrl}
              alt={config.imageAlt || config.productName}
              fill
              className="object-contain p-1.5"
              sizes="64px"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-jungle-900">
            {config.title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink/65 sm:text-sm">
            {config.description} Cadeau offert dès {config.minAmount.toFixed(0)} € d’achat :
            {' '}
            <strong className="text-ink">{config.productName}</strong>.
          </p>
        </div>

        <span className="hidden shrink-0 items-center gap-2 rounded-full bg-jungle-800 px-4 py-2 text-xs font-black uppercase tracking-wider text-cream sm:inline-flex">
          Découvrir
          <ArrowRight size={14} />
        </span>
      </Link>
    </section>
  );
}
