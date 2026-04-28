'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap, registerGsapPlugins } from '@/lib/animations/gsap-setup';

export function FrizeLivraison() {
  const sectionRef = useRef<HTMLElement>(null);
  const carRef     = useRef<HTMLDivElement>(null);
  const textRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();

    const ctx = gsap.context(() => {
      if (!sectionRef.current || !carRef.current || !textRef.current) return;

      const carEl  = carRef.current;
      const textEl = textRef.current;

      const containerW = sectionRef.current!.getBoundingClientRect().width;
      const carW = window.innerWidth < 768 ? 120 : 180;

      // Texte positionné au début de la route (left fixe dans le JSX)
      // Le texte fait ~260px de large → la voiture le dépasse quand car.x ≈ textLeft + textWidth
      const textLeft  = window.innerWidth < 768 ? 12 : 20;   // padding left du texte
      const textWidth = window.innerWidth < 768 ? 180 : 280;  // largeur approx du texte
      const passX     = textLeft + textWidth; // x où la voiture a dépassé le texte

      // Voiture : démarre hors cadre gauche, traverse tout l'écran
      const startX = -carW - 20;
      const endX   = containerW + carW;               // sort hors cadre droit
      const range  = endX - startX;

      // Progression à laquelle la voiture dépasse le texte
      const passProgress = (passX - startX) / range;  // ≈ 0.15–0.20

      gsap.set(carEl,  { x: startX });
      gsap.set(textEl, { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end:   'bottom top',
          scrub: 1.4,
        },
      });

      // Voiture traverse toute la bande
      tl.to(carEl, {
        x: endX,
        ease: 'none',
        duration: 1,
      }, 0);

      // Texte apparaît juste après que la voiture l'a dépassé
      tl.to(textEl, {
        opacity: 1,
        duration: 0.12,
        ease: 'power2.out',
      }, passProgress);
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="frize-livraison"
      className="relative w-full overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #e8f4ea 0%, #f5efe0 100%)' }}
    >
      <div className="relative w-full h-[140px] md:h-[180px] overflow-hidden">

        {/* Route asphaltée */}
        <div className="absolute bottom-0 left-0 right-0 h-[44px] md:h-[56px] bg-ink/15 rounded-t-sm" />

        {/* Pointillés route */}
        <div className="absolute bottom-[14px] md:bottom-[18px] left-0 right-0 h-[6px] flex gap-[48px] px-4 pointer-events-none">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="h-[6px] w-10 bg-white/70 rounded-full shrink-0" />
          ))}
        </div>

        {/* Texte — position fixe au début de la route */}
        <div
          ref={textRef}
          className="absolute left-3 md:left-5 top-[18%] md:top-[20%] z-10"
        >
          <p className="title-chunky-light text-xl md:text-3xl lg:text-4xl leading-tight text-ink whitespace-nowrap">
            Ou gagn out komand an 72h
          </p>
          <p className="text-ink/55 text-[10px] md:text-xs font-semibold uppercase tracking-widest mt-0.5">
            Livraison à La Réunion
          </p>
        </div>

        {/* Voiture + fumée */}
        <div
          ref={carRef}
          className="absolute bottom-[38px] md:bottom-[48px] left-0 z-20 w-[120px] md:w-[180px]"
        >
          {/* Fumée d'échappement — 3 bouffées décalées */}
          {[0, 0.35, 0.7].map((delay, i) => (
            <div
              key={i}
              className="smoke-puff"
              style={{
                position: 'absolute',
                left: '4%',
                bottom: '48%',
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: 'rgba(80,80,80,0.55)',
                animationDelay: `${delay}s`,
              }}
            />
          ))}
          <Image
            src="/images/sections/camion-taxi.png"
            alt="Camion taxi péi"
            width={400}
            height={220}
            className="w-full h-auto"
            style={{ mixBlendMode: 'multiply' }}
            unoptimized
          />
        </div>

        <style>{`
          @keyframes smoke {
            0%   { transform: translate(0, 0)       scale(0.4); opacity: 0.7; }
            100% { transform: translate(-28px, -38px) scale(2.2); opacity: 0; }
          }
          .smoke-puff {
            animation: smoke 1.1s ease-out infinite;
            pointer-events: none;
          }
        `}</style>

      </div>
    </section>
  );
}
