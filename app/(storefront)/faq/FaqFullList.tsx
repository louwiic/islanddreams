'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type FaqItem = { id: string; question: string; answer: string };

export function FaqFullList({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {items.map((faq) => {
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
    </div>
  );
}
