'use client';

import Image from 'next/image';
import { mapMagnets } from '@/lib/data/communes';
import { BubbleDesktop } from './BubbleDesktop';
import { BubbleMobile } from './BubbleMobile';

export function FridgeCollection() {

  const handleCommuneClick = () => {
    const carousel = document.getElementById('product-carousel');
    if (carousel) {
      carousel.scrollIntoView({ behavior: 'smooth' });
      window.dispatchEvent(new CustomEvent('select-category', { detail: 'Magnets' }));
    }
  };

  return (
    <section
      className="relative w-full py-16 md:py-28 px-4 md:px-6 overflow-hidden"
      id="fridge-section"
    >
      <Image
        src="/images/map/fond-carte-reunion.jpg"
        alt=""
        fill
        className="object-cover"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-cream/50" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="title-chunky text-4xl md:text-6xl lg:text-7xl">
            COLLECTIONNEZ VOS
            <br />
            MAGNETS PÉI
          </h2>
          <p className="mt-5 text-ink/70 text-base md:text-xl italic max-w-xl mx-auto">
            Découvre le trésor que cache ta commune, clique sur la tienne&nbsp;!
          </p>
        </div>

        <div className="relative mx-auto max-w-[90vw] md:max-w-[680px]">
          <div className="relative" id="fridge-door">
            <Image
              src="/images/map/carte-reunion.webp"
              alt="Carte illustrée de La Réunion"
              width={1228}
              height={1080}
              className="w-full h-auto"
              priority
            />

            {mapMagnets.map((commune) => (
              <button
                key={commune.id}
                className="fridge-target absolute z-10 cursor-pointer rounded-full hover:ring-2 hover:ring-sun-400 hover:ring-offset-2 transition-all"
                data-commune-id={commune.id}
                onClick={handleCommuneClick}
                aria-label={`Voir les magnets — ${commune.name}`}
                style={{
                  left: `${commune.mapTarget.x}%`,
                  top: `${commune.mapTarget.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 55,
                  height: 55,
                }}
              >
                {commune.id === 'cilaos' ? (
                  <>
                    <span className="absolute inset-[-16px] rounded-full bg-jungle-400/40 animate-ping" style={{ animationDuration: '1.5s' }} />
                    <span className="absolute inset-[-10px] rounded-full bg-jungle-500/30 animate-pulse" />
                    <span className="absolute inset-[-4px] rounded-full border-3 border-jungle-400/70 animate-pulse" />
                    <span className="absolute inset-[-8px] rounded-full shadow-[0_0_20px_6px_rgba(47,106,60,0.5)]" />
                  </>
                ) : (
                  <>
                    <span className="absolute inset-[-6px] rounded-full bg-sun-400/20 animate-ping" style={{ animationDuration: '3s' }} />
                    <span className="absolute inset-[-3px] rounded-full bg-sun-400/10 animate-pulse" />
                  </>
                )}
              </button>
            ))}
          </div>

          <BubbleDesktop onClick={handleCommuneClick} />
        </div>

        <BubbleMobile onClick={handleCommuneClick} />

        {/* "Scrolle" — Desktop seulement */}
        <p className="hidden md:block text-center mt-8 text-ink/50 text-xs md:text-sm italic">
          Scrolle pour voir la collection se composer sur la carte
        </p>
      </div>
    </section>
  );
}
