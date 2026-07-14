'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

type FaqItem = { id: string; question: string; answer: string };

export function ProductFaq({ items }: { items: FaqItem[] }) {
  const { t } = useLanguage();
  const [openId, setOpenId] = useState<string | null>(null);

  if (items.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <h2 className="text-sm font-bold text-ink uppercase tracking-wider mb-4">
        {t('product.frequentQuestions')}
      </h2>
      <div className="space-y-2">
        {items.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-ink pr-4">{faq.question}</span>
                <ChevronDown
                  size={16}
                  className={cn(
                    'shrink-0 text-gray-400 transition-transform duration-200',
                    isOpen && 'rotate-180'
                  )}
                />
              </button>
              <div
                className={cn(
                  'grid transition-all duration-200',
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-4 pb-3 text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
