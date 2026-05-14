// Bandeau USP — 4 arguments de vente en créole

import Image from 'next/image';

const USP_ITEMS = [
  {
    src: '/images/usp-cocotier.png',
    alt: 'Cocotier illustré',
    title: 'DESIGN INIK',
    subtitle: '(DESIGNS EXCLUSIFS)',
  },
  {
    src: '/images/usp-cameleon.png',
    alt: 'Caméléon illustré',
    title: "L'ESPRIT RÉNYONÉ",
    subtitle: '(RÉUNION LIFESTYLE)',
  },
  {
    src: '/images/usp-voiture.svg',
    alt: 'Voiture livraison',
    title: 'OU GAGN OUT KOMAND',
    subtitle: 'AN 72H',
  },
  {
    src: '/images/usp-magnet.png',
    alt: 'Magnet Island Dreams 974',
    title: 'MAGNÈT LÉ GAYAR',
    subtitle: '',
  },
];

export function UspBanner() {
  return (
    <section className="bg-cream border-y border-jungle-200/30">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {USP_ITEMS.map((item) => (
          <div key={item.title} className="flex flex-col items-center gap-4 text-center">
            <Image
              src={item.src}
              alt={item.alt}
              width={96}
              height={96}
              className="w-24 h-24 object-contain"
            />
            <p className="text-ink font-bold text-sm uppercase leading-snug tracking-wide">
              {item.title}
              {item.subtitle && (
                <span className="block font-semibold text-ink/60 text-xs mt-0.5">{item.subtitle}</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
