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

      // ── 2. Timeline progress line ────────────────────────────────
      const progress = document.getElementById('timeline-progress');
      const line = document.getElementById('timeline-line');
      if (progress && line) {
        gsap.to(progress, {
          height: line.offsetHeight,
          ease: 'none',
          scrollTrigger: {
            trigger: line,
            start: 'top 20%',
            end: 'bottom 80%',
            scrub: 0.8,
          },
        });
      }

      // ── 3. Timeline blocks — fade in + slide ─────────────────────
      document.querySelectorAll('.timeline-block').forEach((block, i) => {
        const isLeft = i % 2 === 0; // alternance gauche/droite
        const content = block.querySelector('.ml-14, .md\\:ml-auto, .md\\:ml-0') || block.lastElementChild;
        if (!content) return;

        gsap.fromTo(content,
          { opacity: 0, x: isLeft ? -40 : 40, y: 20 },
          {
            opacity: 1, x: 0, y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: block,
              start: 'top 80%',
              once: true,
            },
          }
        );
      });

      // ── 4. Timeline dots — pop (petits dots classiques) ──────────
      document.querySelectorAll('.timeline-dot:not(.timeline-char)').forEach((dot) => {
        gsap.fromTo(dot,
          { scale: 0 },
          {
            scale: 1,
            duration: 0.4,
            ease: 'back.out(3)',
            scrollTrigger: {
              trigger: dot,
              start: 'top 85%',
              once: true,
            },
          }
        );
      });

      // ── 4b. Timeline characters — apparition au scroll ──────────
      document.querySelectorAll('.timeline-char').forEach((charDot) => {
        gsap.fromTo(charDot,
          { scale: 0, rotation: -20, opacity: 0 },
          {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'back.out(2.5)',
            scrollTrigger: {
              trigger: charDot,
              start: 'top 85%',
              once: true,
            },
          }
        );
      });

      // ── 5. Clip-path reveal sur les titres ───────────────────────
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

      // ── 6. Pull quote — barre qui se trace ───────────────────────
      const quote = document.getElementById('apropos-quote');
      if (quote) {
        const textP = quote.querySelector('p');
        if (textP) gsap.set(textP, { opacity: 0, x: -20 });

        ScrollTrigger.create({
          trigger: quote,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            const tl = gsap.timeline();
            if (textP) {
              tl.to(textP, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' });
            }
          },
        });
      }

      // ── 7. Magnets pop en stagger ───────────────────────────────
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

      // ── 8. Compteur chiffres clés ───────────────────────────────
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

      // ── 9. Timeline cards — stagger in ──────────────────────────
      document.querySelectorAll('.timeline-card').forEach((card) => {
        gsap.fromTo(card,
          { opacity: 0, y: 20, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              once: true,
            },
          }
        );
      });

      // ── 10. Year badges — pop ───────────────────────────────────
      document.querySelectorAll('.timeline-year').forEach((badge) => {
        gsap.fromTo(badge,
          { opacity: 0, scale: 0.5 },
          {
            opacity: 1, scale: 1,
            duration: 0.4,
            ease: 'back.out(2)',
            scrollTrigger: {
              trigger: badge,
              start: 'top 88%',
              once: true,
            },
          }
        );
      });

    });

    return () => ctx.revert();
  }, []);

  return null;
}
