// FlyingMagnets — animation "chute douce"
// Les magnets tombent du 974 (quand il est semi-caché en haut)
// et descendent avec un wobble vers leurs cibles sur la carte.

'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Magnet } from '@/components/ui/Magnet';
import { otherMagnets } from '@/lib/data/communes';
import {
  gsap,
  ScrollTrigger,
  registerGsapPlugins,
} from '@/lib/animations/gsap-setup';

export function FlyingMagnets() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const isMobileRef = useRef(false);

  useEffect(() => {
    isMobileRef.current = window.innerWidth < 768;
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    registerGsapPlugins();
    const mobile = isMobileRef.current;

    const ctx = gsap.context(() => {
      const sourceEl = document.getElementById('hero-magnet-974');
      const fridgeEl = document.getElementById('fridge-door');
      const fridgeSectionEl = document.getElementById('fridge-section');
      const magnetsEls = gsap.utils.toArray<HTMLElement>('.flying-magnet');

      if (!sourceEl || !fridgeEl || !fridgeSectionEl || magnetsEls.length === 0) return;

      const getSourcePos = () => {
        const rect = sourceEl.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 + window.scrollX,
          y: rect.top + rect.height / 2 + window.scrollY,
        };
      };

      const getTargetPos = (communeId: string) => {
        const targetEl = fridgeEl.querySelector(
          `[data-commune-id="${communeId}"]`,
        ) as HTMLElement | null;
        if (!targetEl) return { x: 0, y: 0 };
        const rect = targetEl.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 + window.scrollX,
          y: rect.top + rect.height / 2 + window.scrollY,
        };
      };

      // État initial : cachés au centre du 974
      magnetsEls.forEach((el) => {
        const { x, y } = getSourcePos();
        gsap.set(el, {
          x,
          y,
          xPercent: -50,
          yPercent: -50,
          scale: 0,
          opacity: 0,
        });
      });

      const total = magnetsEls.length;

      // Déclenche quand le 974 est semi-caché (scroll ~60% du hero)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sourceEl,
          start: 'center 15%',        // le 974 est presque sorti en haut
          endTrigger: fridgeSectionEl,
          end: 'center center',
          scrub: 2,
          invalidateOnRefresh: true,
        },
      });

      magnetsEls.forEach((el, i) => {
        const communeId = el.dataset.communeId!;
        const target = getTargetPos(communeId);
        const source = getSourcePos();

        const stagger = (i / total) * 0.4;

        // Wobble latéral — alternance gauche/droite
        const wobbleX = (mobile ? 50 : 100) * (i % 2 === 0 ? 1 : -1);
        const dropDistance = mobile ? 80 : 150;

        // Phase 1 — Apparition juste sous le 974 (on ne voit pas la sortie)
        tl.to(
          el,
          {
            y: source.y + dropDistance * 0.3,
            scale: mobile ? 0.7 : 1,
            opacity: 1,
            duration: 0.06,
            ease: 'power2.out',
          },
          stagger,
        )
          // Phase 2 — Chute douce avec wobble latéral
          .to(
            el,
            {
              motionPath: {
                path: [
                  { x: source.x, y: source.y + dropDistance * 0.3 },
                  {
                    x: source.x + wobbleX,
                    y: source.y + dropDistance,
                  },
                  {
                    x: target.x - wobbleX * 0.4,
                    y: source.y + (target.y - source.y) * 0.5,
                  },
                  {
                    x: target.x + wobbleX * 0.2,
                    y: target.y - 30,
                  },
                  { x: target.x, y: target.y },
                ],
                curviness: 1.8,
              },
              scale: 1,
              rotation: gsap.utils.random(-12, 12, 1),
              duration: 0.8,
              ease: 'power1.inOut',
            },
            `>-0.02`,
          )
          // Phase 3 — Atterrissage magnétique doux
          .to(
            el,
            {
              scale: 1.08,
              duration: 0.04,
              ease: 'power3.in',
            },
            '>',
          )
          .to(
            el,
            {
              scale: 1,
              duration: 0.06,
              ease: 'elastic.out(1, 0.3)',
            },
            '>',
          );
      });
    });

    return () => ctx.revert();
  }, [mounted]);

  if (!mounted) return null;

  const magnetSize = isMobileRef.current ? 44 : 70;

  return createPortal(
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-40"
      aria-hidden
    >
      {otherMagnets.map((commune) => (
        <div
          key={commune.id}
          className="flying-magnet absolute top-0 left-0"
          data-commune-id={commune.id}
          style={{ willChange: 'transform' }}
        >
          <Magnet commune={commune} size={magnetSize} />
        </div>
      ))}
    </div>,
    document.body,
  );
}
