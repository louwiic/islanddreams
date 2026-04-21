'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { mapMagnets } from '@/lib/data/communes';
import { gsap, ScrollTrigger, registerGsapPlugins } from '@/lib/animations/gsap-setup';

export function FridgeCollection() {
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();
    if (!bubbleRef.current) return;

    gsap.set(bubbleRef.current, { scale: 0, opacity: 0 });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: '#fridge-door',
        start: 'top 70%',
        once: true,
        onEnter: () => {
          gsap.timeline({ delay: 2 })
            .to(bubbleRef.current, { scale: 1.3, opacity: 1, duration: 0.15, ease: 'power4.out' })
            .to(bubbleRef.current, { scale: 1, duration: 0.3, ease: 'back.out(3)' });
        },
      });
    });

    return () => ctx.revert();
  }, []);

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

          {/* Bulle BD */}
          <div
            ref={bubbleRef}
            onClick={handleCommuneClick}
            className="absolute -right-2 md:-right-[170px] top-[22%] cursor-pointer hover:scale-105 transition-transform z-50"
          >
            <div className="relative bg-white rounded-2xl px-3 py-2 md:px-5 md:py-3 shadow-xl border-2 border-ink max-w-[130px] md:max-w-[210px]">
              <p className="text-ink font-bold text-[11px] md:text-sm leading-snug text-center">
                Hey, clique sur ta commune&nbsp;! 😉
              </p>
              <div
                className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-white border-b-2 border-l-2 border-ink"
                style={{ transform: 'rotate(45deg)' }}
              />
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-ink/50 text-xs md:text-sm italic">
          Scrolle pour voir la collection se composer sur la carte
        </p>
      </div>
    </section>
  );
}
