'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export type HomeReview = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

function ReviewStars({ rating }: { rating: number }) {
  return (
    <div className="flex justify-center gap-0.5" aria-label={`${rating}/5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={cn('text-base', star <= rating ? 'text-sun-400' : 'text-ink/15')}
        >
          &#9733;
        </span>
      ))}
    </div>
  );
}

export function HomeReviewsCarousel({ reviews }: { reviews: HomeReview[] }) {
  const { t } = useLanguage();
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (reviews.length === 0) return;

    const centerSlide = (index: number) => {
      const viewport = viewportRef.current;
      const slide = slideRefs.current[index];
      if (!viewport || !slide) return;

      const left = slide.offsetLeft - viewport.clientWidth / 2 + slide.clientWidth / 2;
      viewport.scrollTo({ left, behavior: 'smooth' });
    };

    centerSlide(activeIndex);

    if (reviews.length === 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % reviews.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [activeIndex, reviews.length]);

  if (reviews.length === 0) return null;

  return (
    <section className="bg-cream py-16 px-0 overflow-hidden">
      <div className="px-6 text-center">
        <h2 className="font-[family-name:var(--font-oswald)] text-3xl md:text-4xl font-bold text-ink uppercase tracking-wide mb-3">
          {t('home.reviews.title')}
        </h2>
        <p className="text-gray-500 text-sm mb-10 italic">
          {t('home.reviews.subtitle')}
        </p>
      </div>

      <div
        ref={viewportRef}
        className="no-scrollbar overflow-x-auto scroll-smooth"
        aria-label={t('home.reviews.label')}
      >
        <div className="flex w-max gap-4 px-[calc(50vw-9.5rem)] sm:px-[calc(50vw-12rem)] md:px-[calc(50vw-14rem)]">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              ref={(el) => {
                slideRefs.current[index] = el;
              }}
              className={cn(
                'w-76 sm:w-96 md:w-[28rem] shrink-0 rounded-2xl border bg-white p-6 text-center shadow-sm transition-all duration-500',
                activeIndex === index
                  ? 'border-jungle-200 opacity-100 shadow-xl shadow-jungle-900/10'
                  : 'border-gray-200 opacity-70'
              )}
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-jungle-100 text-sm font-black text-jungle-700">
                {review.customer_name.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-bold text-ink">{review.customer_name}</p>
              <div className="mt-2">
                <ReviewStars rating={review.rating} />
              </div>
              <p className="mt-4 line-clamp-5 text-sm leading-relaxed text-gray-600">
                “{review.comment}”
              </p>
              <p className="mt-4 text-xs text-gray-400">
                {new Date(review.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center px-6">
        <Link
          href="/avis"
          className="inline-flex items-center gap-2 rounded-full bg-jungle-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-jungle-700"
        >
          Laisser un avis
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
