'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger, registerGsapPlugins } from '@/lib/animations/gsap-setup';

export function FrizeLivraison() {
  const sectionRef  = useRef<HTMLElement>(null);
  const carRef      = useRef<HTMLDivElement>(null);
  const textRef     = useRef<HTMLDivElement>(null);
  const road1Ref    = useRef<HTMLDivElement>(null);
  const road2Ref    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();

    const ctx = gsap.context(() => {
      if (!sectionRef.current || !carRef.current || !textRef.current) return;

      const carEl  = carRef.current;
      const textEl = textRef.current;
      const r1El   = road1Ref.current;
      const r2El   = road2Ref.current;

      const containerW = sectionRef.current!.getBoundingClientRect().width;

      // Largeur voiture (même que dans le JSX)
      const carW = window.innerWidth < 768 ? 120 : 180;

      // Position de départ (hors cadre gauche) et d'arrivée (près du bord droit)
      const startX  = -carW - 20;
      const landX   = containerW * 0.62 - carW / 2;  // s'arrête à ~60% de la largeur

      // États initiaux
      gsap.set(carEl,  { x: startX });
      gsap.set(textEl, { opacity: 0, x: 30 });
      if (r1El) gsap.set(r1El, { x: 0 });
      if (r2El) gsap.set(r2El, { x: '100%' });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          end:   'bottom 15%',
          scrub: 1.4,
        },
      });

      // Bandes de route qui défilent (illusion de mouvement)
      if (r1El) tl.to(r1El, { x: '-100%', ease: 'none', duration: 1 }, 0);
      if (r2El) tl.to(r2El, { x: '0%',    ease: 'none', duration: 1 }, 0);

      // Voiture avance
      tl.to(carEl, {
        x: landX,
        ease: 'power1.inOut',
        duration: 1,
      }, 0);

      // Légère oscillation verticale pendant le roulage (simulée via scrub)
      tl.to(carEl, {
        y: -4,
        duration: 0.12,
        yoyo: true,
        repeat: 5,
        ease: 'sine.inOut',
      }, 0.05);

      // Texte arrive quand la voiture est ~60% du chemin
      tl.to(textEl, {
        opacity: 1,
        x: 0,
        ease: 'power3.out',
        duration: 0.35,
      }, 0.62);
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
      {/* Bande de route */}
      <div className="relative w-full h-[140px] md:h-[180px] overflow-hidden">

        {/* Ciel léger */}
        <div className="absolute inset-0" />

        {/* Route — couche asphaltée */}
        <div className="absolute bottom-0 left-0 right-0 h-[44px] md:h-[56px] bg-ink/15 rounded-t-sm" />

        {/* Marquages au sol — deux tuiles qui défilent */}
        <div className="absolute bottom-[14px] md:bottom-[18px] left-0 right-0 h-[6px] overflow-hidden pointer-events-none">
          <div ref={road1Ref} className="absolute top-0 left-0 w-full flex gap-[48px]">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="h-[6px] w-10 bg-white/70 rounded-full shrink-0" />
            ))}
          </div>
          <div ref={road2Ref} className="absolute top-0 left-0 w-full flex gap-[48px]">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="h-[6px] w-10 bg-white/70 rounded-full shrink-0" />
            ))}
          </div>
        </div>

        {/* Voiture */}
        <div
          ref={carRef}
          className="absolute bottom-[38px] md:bottom-[48px] left-0 z-20 w-[120px] md:w-[180px]"
        >
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

        {/* Texte "Livraison en 72h" */}
        <div
          ref={textRef}
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center text-center"
        >
          <p className="title-chunky-light text-2xl md:text-4xl lg:text-5xl leading-tight text-ink">
            Livraison en 72h
          </p>
          <p className="text-ink/60 text-xs md:text-sm font-semibold uppercase tracking-widest mt-1">
            à La Réunion
          </p>
        </div>
      </div>
    </section>
  );
}
