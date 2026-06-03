'use client';

import Image from 'next/image';
import { ArrowRight, Gift } from 'lucide-react';
import { TrackedEventLink } from './TrackedEventLink';

export type EventFeatureConfig = {
  enabled: boolean;
  badge: string;
  title: string;
  description: string;
  ctaLabel: string;
  image: string | null;
  imageAlt: string | null;
  href: string;
};

export function EventProductFeature({ config }: { config: EventFeatureConfig | null }) {
  if (!config?.enabled) return null;

  const featureImage = config.image;
  const featureImageAlt = config.imageAlt || config.title;

  return (
    <section id="evenement-special" className="relative scroll-mt-32 overflow-hidden bg-jungle-800 px-4 py-12 md:px-6 md:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(245,193,68,0.22),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(90,180,190,0.24),transparent_30%)]" />
      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 md:grid-cols-[0.92fr_1.08fr]">
        <TrackedEventLink
          href={config.href}
          eventName="event_home_image_clicked"
          eventProps={{
            title: config.title,
            badge: config.badge,
            cta_label: config.ctaLabel,
          }}
          className="group relative mx-auto block w-full max-w-[420px] overflow-hidden rounded-2xl bg-cream p-6 shadow-2xl shadow-black/25 ring-1 ring-white/10"
        >
          <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-jungle-800 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-cream">
            <Gift size={13} />
            {config.badge}
          </div>
          <div className="relative aspect-square">
            {featureImage ? (
              <Image
                src={featureImage}
                alt={featureImageAlt}
                fill
                className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 90vw, 420px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-white/60 text-jungle-800">
                <Gift size={42} />
              </div>
            )}
          </div>
        </TrackedEventLink>

        <div className="text-center md:text-left">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-sun-400 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-ink">
            <Gift size={14} />
            {config.badge}
          </p>
          <h2 className="title-chunky-light text-4xl leading-none text-cream md:text-6xl">
            {config.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-cream/75 md:mx-0 md:text-base">
            {config.description}
          </p>

          <div className="mt-7 flex justify-center md:justify-start">
            <TrackedEventLink
              href={config.href}
              eventName="event_home_cta_clicked"
              eventProps={{
                title: config.title,
                badge: config.badge,
                cta_label: 'Découvrir les produits',
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sun-400 px-6 py-3 text-sm font-black uppercase tracking-wide text-ink transition-colors hover:bg-sun-300"
            >
              Découvrir les produits
              <ArrowRight size={17} />
            </TrackedEventLink>
          </div>
        </div>
      </div>
    </section>
  );
}
