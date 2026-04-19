// Smooth scroll global — Lenis
// Ralentit et fluidifie le scroll sur toute la page

'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from '@/lib/animations/gsap-setup';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.6,       // durée de l'inertie (plus haut = plus lent)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Synchronise Lenis avec GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return null;
}
