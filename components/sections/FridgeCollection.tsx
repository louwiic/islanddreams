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

  const handleBubbleClick = () => {
    const carousel = document.getElementById('product-carousel');
    if (carousel) {
      carousel.scrollIntoView({ behavior: 'smooth' });
      // Déclenche le filtre Magnets via un custom event
      window.dispatchEvent(new CustomEvent('select-category', { detail: 'Magnets' }));
    }
  };

  return (
    <section
      className="relative w-full bg-cream py-12 md:py-24 px-4 md:px-6"
      id="fridge-section"
    >
      <div className="max-w-6xl mx-auto">
        {/* Titre */}
        <div className="text-center mb-8 md:mb-12">
          <p className="text-coral-500 text-xs md:text-sm uppercase tracking-[0.3em] mb-2 md:mb-3">
            Chapitre 2
          </p>
          <h2 className="title-chunky text-3xl md:text-5xl lg:text-7xl">
            COLLECTIONNEZ VOS
            <br />
            MAGNETS PÉI
          </h2>
          <p className="mt-2 text-ink/50 text-sm md:text-base font-semibold tracking-wide">
            Island Dreams
          </p>
          <p className="mt-3 md:mt-4 text-ink/70 text-sm md:text-lg italic max-w-2xl mx-auto">
            Réunissez les 27 magnets des communes de l&apos;île sur votre carte magnétique murale et offrez-vous un voyage inoubliable !
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
                className="fridge-target absolute z-10 cursor-pointer rounded-full hover:ring-2 hover:ring-sun-400 hover:ring-offset-2 transition-all"
                data-commune-id={commune.id}
                onClick={handleBubbleClick}
                aria-label={`Voir le magnet ${commune.name}`}
                style={{
                  left: `${commune.mapTarget.x}%`,
                  top: `${commune.mapTarget.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 50,
                  height: 50,
                }}
              />
            ))}
          </div>

          {/* Bulle BD */}
          <div
            ref={bubbleRef}
            onClick={handleBubbleClick}
            className="absolute -right-4 md:-right-16 top-4 md:top-8 cursor-pointer hover:scale-105 transition-transform z-10"
          >
            <div className="relative bg-white rounded-2xl px-5 py-3 md:px-6 md:py-4 shadow-lg border-2 border-ink max-w-[180px] md:max-w-[220px]">
              <p className="text-ink font-bold text-xs md:text-sm leading-snug text-center">
                Hey, clique sur ta commune ! 😉
              </p>
              {/* Queue de la bulle BD */}
              <div
                className="absolute -bottom-3 left-8 w-6 h-6 bg-white border-b-2 border-l-2 border-ink"
                style={{ transform: 'rotate(-45deg)' }}
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
