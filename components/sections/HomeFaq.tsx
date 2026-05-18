'use client';

import { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type FaqItem = { id: string; question: string; answer: string };

const HOME_LIMIT = 6;

export function HomeFaq({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (items.length === 0) return null;

  const visible = items.slice(0, HOME_LIMIT);

  return (
    <section className="bg-cream py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-[family-name:var(--font-oswald)] text-3xl md:text-4xl font-bold text-ink text-center uppercase tracking-wide mb-3">
          Questions fréquentes
        </h2>
        <p className="text-center text-gray-500 text-sm mb-10 italic">
          Tout ce que vous devez savoir sur Island Dreams
        </p>

        <div className="space-y-3">
          {visible.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <span className="text-sm md:text-base font-semibold text-ink pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={cn(
                      'shrink-0 text-jungle-600 transition-transform duration-300',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>
                <div
                  className={cn(
                    'grid transition-all duration-300 ease-in-out',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* CTA vers page FAQ complète */}
          <Link
            href="/faq"
            className="flex items-center justify-between px-5 py-4 bg-jungle-600 hover:bg-jungle-700 text-white rounded-xl shadow-sm transition-colors"
          >
            <span className="text-sm md:text-base font-semibold">
              Vous avez encore des questions ?
            </span>
            <ArrowRight size={18} className="shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}
