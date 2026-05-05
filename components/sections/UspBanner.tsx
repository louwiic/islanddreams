// Bandeau USP — 4 arguments de vente en créole

import { Diamond, Sparkles, Package, Star } from 'lucide-react';

const USP_ITEMS = [
  {
    icon: Diamond,
    title: 'DESIGN INIK',
    subtitle: '(DESIGNS EXCLUSIFS)',
  },
  {
    icon: Sparkles,
    title: "L'ESPRIT RÉNYONÉ",
    subtitle: '(RÉUNION LIFESTYLE)',
  },
  {
    icon: Package,
    title: 'OU GAGN OUT KOMAND',
    subtitle: 'AN 72H',
  },
  {
    icon: Star,
    title: 'MAGNÈT LÉ GAYAR',
    subtitle: '',
  },
];

export function UspBanner() {
  return (
    <section className="bg-jungle-100 border-y border-jungle-200">
      <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
        {USP_ITEMS.map((item) => (
          <div key={item.title} className="flex items-center gap-3 justify-center">
            <item.icon className="w-6 h-6 text-jungle-600 shrink-0" strokeWidth={1.5} />
            <p className="text-jungle-800 font-bold text-xs uppercase leading-tight tracking-wide">
              {item.title}
              {item.subtitle && (
                <span className="font-semibold text-jungle-600"> {item.subtitle}</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
