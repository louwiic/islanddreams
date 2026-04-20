// Section Carte — la collection se construit sur la carte de La Réunion
// Bulle BD cliquable qui scroll vers le carousel catégorie Magnets

'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { otherMagnets } from '@/lib/data/communes';
import { gsap, ScrollTrigger, registerGsapPlugins } from '@/lib/animations/gsap-setup';

export function FridgeCollection() {
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();
    if (!bubbleRef.current) return;

    // Bulle cachée au départ
    gsap.set(bubbleRef.current, { scale: 0, opacity: 0 });

    const ctx = gsap.context(() => {
      // Déclenche 5s après que la carte soit visible
      ScrollTrigger.create({
        trigger: '#fridge-door',
        start: 'top 70%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ delay: 2 });
          // Boom : scale overshoot rapide
          tl.to(bubbleRef.current, {
            scale: 1.3,
            opacity: 1,
            duration: 0.15,
            ease: 'power4.out',
          })
          // Retour avec rebond
          .to(bubbleRef.current, {
            scale: 1,
            duration: 0.3,
            ease: 'back.out(3)',
          });
        },
      });
    });

    return () => ctx.revert();
  }, []);

  const handleCommuneClick = (communeName: string) => {
    const carousel = document.getElementById('product-carousel');
    if (carousel) {
      carousel.scrollIntoView({ behavior: 'smooth' });
      // Déclenche le filtre par ville via un custom event
      window.dispatchEvent(new CustomEvent('select-ville', { detail: communeName }));
    }
  };

  const handleBubbleClick = () => {
    const carousel = document.getElementById('product-carousel');
    if (carousel) {
      carousel.scrollIntoView({ behavior: 'smooth' });
      window.dispatchEvent(new CustomEvent('select-category', { detail: 'Magnets' }));
    }
  };

  return (
    <section
      className="relative w-full py-12 md:py-24 px-4 md:px-6 overflow-hidden"
      id="fridge-section"
    >
      {/* Fond illustré */}
      <Image
        src="/images/map/fond-carte-reunion.jpg"
        alt=""
        fill
        className="object-cover"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-cream/40" />
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Titre */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="title-chunky text-3xl md:text-5xl lg:text-7xl leading-[1.2]">
            COLLECTIONNEZ VOS
            <br />
            MAGNETS PÉI
          </h2>
          <p className="mt-4 md:mt-6 text-ink/50 text-sm md:text-base font-semibold tracking-wide">
            Island Dreams
          </p>
          <p className="mt-3 md:mt-4 text-ink/70 text-sm md:text-lg italic max-w-2xl mx-auto">
            Découvre le trésor que cache ta commune, clique sur la tienne !
          </p>
        </div>

        {/* La carte de La Réunion */}
        <div className="relative mx-auto max-w-[90vw] md:max-w-[700px]">
          <div className="relative" id="fridge-door">
              <Image
                src="/images/map/carte-reunion.webp"
                alt="Carte illustrée de La Réunion"
                width={1228}
                height={1080}
                className="w-full h-auto"
                priority
              />

              {/* Cibles cliquables où les magnets vont atterrir */}
              {otherMagnets.map((commune) => (
                <button
                  key={commune.id}
                  className="fridge-target absolute z-10 cursor-pointer rounded-full hover:ring-2 hover:ring-sun-400 hover:ring-offset-2 transition-all group/target"
                  data-commune-id={commune.id}
                  onClick={() => handleCommuneClick(commune.name)}
                  aria-label={`Voir le magnet ${commune.name}`}
                  style={{
                    left: `${commune.mapTarget.x}%`,
                    top: `${commune.mapTarget.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 55,
                    height: 55,
                  }}
                >
                  {/* Halo pulsant — renforcé pour Cilaos */}
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

            {/* Bulle BD — à droite de l'île */}
            <div
              ref={bubbleRef}
              onClick={handleBubbleClick}
              className="absolute -right-2 md:-right-[180px] top-[20%] md:top-[30%] cursor-pointer hover:scale-105 transition-transform z-50"
            >
              <div className="relative bg-white rounded-2xl px-3 py-2 md:px-6 md:py-4 shadow-lg border-2 border-ink max-w-[140px] md:max-w-[220px]">
                <p className="text-ink font-bold text-[10px] md:text-sm leading-snug text-center">
                  Hey, clique sur ta commune ! 😉
                </p>
                {/* Queue de la bulle BD — pointe vers la gauche */}
                <div
                  className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-white border-b-2 border-l-2 border-ink"
                  style={{ transform: 'rotate(45deg)' }}
                />
              </div>
            </div>
        </div>

        <p className="text-center mt-6 md:mt-8 text-ink/60 text-xs md:text-sm italic">
          Scrolle pour voir la collection se composer sur la carte
        </p>
      </div>
    </section>
  );
}
