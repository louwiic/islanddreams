'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type FaqItem = { id: string; question: string; answer: string };
type ImageItem = { id?: string; url: string; alt: string | null };

type Props = {
  description?: string;
  images: ImageItem[];
  faqs: FaqItem[];
  productName: string;
  weightGrams?: number | null;
};

export function ProductTabs({ description, images, faqs, productName, weightGrams }: Props) {
  const tabs: { key: string; label: string }[] = [];
  if (description) tabs.push({ key: 'description', label: 'Description' });
  if (images.length > 1) tabs.push({ key: 'galerie', label: 'Galerie' });
  if (faqs.length > 0) tabs.push({ key: 'faq', label: 'FAQ' });

  const [active, setActive] = useState(tabs[0]?.key ?? 'description');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  if (tabs.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto mt-12">
      {/* Onglets */}
      <div className="flex border-b border-gray-200 gap-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={cn(
              'px-5 py-3 text-sm font-bold uppercase tracking-wider transition-colors relative',
              active === tab.key
                ? 'text-jungle-700'
                : 'text-gray-400 hover:text-gray-600'
            )}
          >
            {tab.label}
            {active === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-jungle-600" />
            )}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="py-8">
        {/* Description */}
        {active === 'description' && description && (
          <div>
            <div
              className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: description }}
            />
            {weightGrams && weightGrams > 0 && (
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a3 3 0 0 0-3 3v1h6V6a3 3 0 0 0-3-3Z"/><path d="M4 8h16l-1.5 12a2 2 0 0 1-2 2H7.5a2 2 0 0 1-2-2L4 8Z"/></svg>
                <span>Poids : {weightGrams >= 1000 ? `${(weightGrams / 1000).toFixed(1)} kg` : `${weightGrams} g`}</span>
              </div>
            )}
          </div>
        )}

        {/* Galerie */}
        {active === 'galerie' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.slice(0, 8).map((img, i) => (
              <div key={img.id ?? i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                <Image
                  src={img.url}
                  alt={img.alt || `${productName} — photo ${i + 1}`}
                  fill
                  className="object-contain p-3"
                  sizes="(max-width: 768px) 45vw, 250px"
                />
              </div>
            ))}
          </div>
        )}

        {/* FAQ */}
        {active === 'faq' && (
          <div className="space-y-2 max-w-3xl">
            {faqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
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
                  <div className={cn(
                    'grid transition-all duration-200',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  )}>
                    <div className="overflow-hidden">
                      <p className="px-4 pb-3 text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
