'use client';

import { useEffect } from 'react';
import { gsap, ScrollTrigger, registerGsapPlugins } from '@/lib/animations/gsap-setup';

export function AProposAnimations() {
  useEffect(() => {
    registerGsapPlugins();

    const ctx = gsap.context(() => {

      // ── 1. Parallaxe hero ────────────────────────────────────────
      const heroText = document.getElementById('apropos-hero-text');
      if (heroText) {
        gsap.to(heroText, {
          y: -60,
          ease: 'none',
          scrollTrigger: {
            trigger: heroText.closest('section')!,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }

      // ── 2. Clip-path reveal sur les titres ───────────────────────
      document.querySelectorAll('.apropos-title').forEach((title) => {
        gsap.fromTo(title,
          { clipPath: 'inset(100% 0 0 0)' },
          {
            clipPath: 'inset(0% 0 0 0)',
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: title,
              start: 'top 85%',
              once: true,
            },
          }
        );
      });

      // ── 3. Pull quote — barre qui se trace puis texte apparaît ──
      const quote = document.getElementById('apropos-quote');
      if (quote) {
        const bar = quote as HTMLElement;
        const textP = quote.querySelector('p');

        gsap.set(bar, { borderLeftColor: 'transparent' });
        if (textP) gsap.set(textP, { opacity: 0, x: -20 });

        ScrollTrigger.create({
          trigger: quote,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            const tl = gsap.timeline();
            // La barre jaune apparaît de haut en bas
            tl.fromTo(bar,
              { borderImage: 'linear-gradient(to bottom, var(--color-sun-400) 0%, transparent 0%) 1' },
              {
                borderImage: 'linear-gradient(to bottom, var(--color-sun-400) 100%, transparent 100%) 1',
                duration: 0.6,
                ease: 'power2.out',
              }
            );
            // Le texte slide depuis la gauche
            if (textP) {
              tl.to(textP, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, '-=0.2');
            }
          },
        });
      }

      // ── 4. Magnets pop en stagger ───────────────────────────────
      const magnetGrid = document.getElementById('apropos-magnets');
      if (magnetGrid) {
        const badges = magnetGrid.querySelectorAll('.magnet-badge');
        gsap.set(badges, { scale: 0, rotation: () => gsap.utils.random(-25, 25) });

        ScrollTrigger.create({
          trigger: magnetGrid,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            gsap.to(badges, {
              scale: 1,
              rotation: 0,
              duration: 0.4,
              ease: 'back.out(2.5)',
              stagger: { amount: 0.8, from: 'center' },
            });
          },
        });
      }

      // ── 5. Compteur chiffres clés ───────────────────────────────
      const statsGrid = document.getElementById('apropos-stats');
      if (statsGrid) {
        const statEls = statsGrid.querySelectorAll('.stat-number');

        ScrollTrigger.create({
          trigger: statsGrid,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            statEls.forEach((el) => {
              const target = Number((el as HTMLElement).dataset.target) || 0;
              const suffix = (el as HTMLElement).dataset.suffix || '';
              const obj = { val: 0 };

              gsap.to(obj, {
                val: target,
                duration: 1.8,
                ease: 'power2.out',
                onUpdate: () => {
                  el.textContent = `${Math.round(obj.val)}${suffix}`;
                },
              });
            });
          },
        });
      }

    });

    return () => ctx.revert();
  }, []);

  return null;
}
