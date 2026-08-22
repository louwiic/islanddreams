'use client';

import { ShieldCheck, Truck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function TrustBanner({ variant = 'home' }: { variant?: 'home' | 'footer' }) {
  const { t } = useLanguage();
  const isFooter = variant === 'footer';

  const items = [
    { icon: ShieldCheck, label: t('trust.securePayment') },
    { icon: Truck, label: t('trust.mainlandDelivery') },
  ];

  return (
    <div
      className={
        isFooter
          ? 'rounded-lg border border-cream/15 bg-cream/10 px-4 py-3 text-cream'
          : 'relative z-30 bg-jungle-800 text-cream shadow-md'
      }
    >
      <div
        className={
          isFooter
            ? 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center'
            : 'mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-4 pb-3 pt-24 text-center sm:flex-row sm:gap-6 md:pt-28'
        }
      >
        {items.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.18em] sm:text-sm"
          >
            <Icon className="h-4 w-4 flex-shrink-0 text-sun-400" strokeWidth={2.5} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
