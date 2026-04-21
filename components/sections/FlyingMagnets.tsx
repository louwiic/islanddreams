// FlyingMagnets
// Phase 1 (scrub)   : le 974 descend du hero vers la carte au fil du scroll
// Phase 2 (auto)    : dès que la carte est bien visible → explosion + burst automatique

'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Magnet } from '@/components/ui/Magnet';
import { mapMagnets } from '@/lib/data/communes';
import { gsap, ScrollTrigger, registerGsapPlugins } from '@/lib/animations/gsap-setup';

export function FlyingMagnets() {
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
      const sourceEl       = document.getElementById('hero-magnet-974');
      const fridgeEl       = document.getElementById('fridge-door');
      const fridgeSectionEl = document.getElementById('fridge-section');
      const clone974El     = document.getElementById('flying-974-clone');
      const flashEl        = document.getElementById('flying-flash');
      const magnetsEls     = gsap.utils.toArray<HTMLElement>('.flying-magnet');

      if (!sourceEl || !fridgeEl || !fridgeSectionEl || !clone974El || magnetsEls.length === 0) return;

      const communeMap = new Map(mapMagnets.map((c) => [c.id, c]));

      // Positions au montage (scrollY = 0)
      const sr = sourceEl.getBoundingClientRect();
      const fr = fridgeEl.getBoundingClientRect();
      const srcX = sr.left + sr.width  / 2 + window.scrollX;
      const srcY = sr.top  + sr.height / 2 + window.scrollY;
      const mapX = fr.left + fr.width  / 2 + window.scrollX;
      const mapY = fr.top  + fr.height / 2 + window.scrollY;

      const getTargetPos = (communeId: string) => {
        const el = fridgeEl.querySelector(`[data-commune-id="${communeId}"]`) as HTMLElement | null;
        if (!el) return { x: mapX, y: mapY };
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width  / 2 + window.scrollX,
          y: r.top  + r.height / 2 + window.scrollY,
        };
      };

      // ── État initial ──────────────────────────────────────────────────
      gsap.set(clone974El, {
        x: srcX, y: srcY,
        xPercent: -50, yPercent: -50,
        opacity: 0, scale: 1,
      });
      if (flashEl) {
        gsap.set(flashEl, {
          x: mapX, y: mapY,
          xPercent: -50, yPercent: -50,
          scale: 0, opacity: 0,
        });
      }
      magnetsEls.forEach((el) => {
        gsap.set(el, {
          x: mapX, y: mapY,
          xPercent: -50, yPercent: -50,
          scale: 0, opacity: 0,
        });
      });

      // ── Phase 1 : descente scrubée ────────────────────────────────────
      // S'arrête quand le haut de la section carte atteint le centre viewport
      const descentTl = gsap.timeline({
        scrollTrigger: {
          trigger: sourceEl,
          start: 'center 20%',
          endTrigger: fridgeSectionEl,
          end: 'top center',
          scrub: 3,
          invalidateOnRefresh: true,
        },
      });

      descentTl
        .to(clone974El, { opacity: 1, duration: 0.08, ease: 'none' }, 0)
        .to(clone974El, {
          x: mapX,
          y: mapY,
          scale: mobile ? 0.4 : 0.5,
          duration: 1,
          ease: 'power1.inOut',
        }, 0);

      // Cache le vrai 974 quand le clone prend le relais
      ScrollTrigger.create({
        trigger: sourceEl,
        start: 'center 20%',
        onEnter:     () => gsap.to(sourceEl, { opacity: 0, duration: 0.25 }),
        onLeaveBack: () => gsap.to(sourceEl, { opacity: 1, duration: 0.3 }),
      });

      // ── Phase 2 : explosion + burst automatique ───────────────────────
      let burstPlayed = false;
      let activeBurstTl: gsap.core.Timeline | null = null;

      const resetAll = () => {
        burstPlayed = false;
        activeBurstTl?.kill();
        activeBurstTl = null;

        gsap.set(clone974El, { x: srcX, y: srcY, scale: 1, opacity: 0 });
        if (flashEl) gsap.set(flashEl, { scale: 0, opacity: 0 });
        magnetsEls.forEach((el) => {
          gsap.set(el, { x: mapX, y: mapY, scale: 0, opacity: 0 });
        });
      };

      const playBurst = () => {
        if (burstPlayed) return;
        burstPlayed = true;

        const total = magnetsEls.length;

        // Clone au centre si le scrub n'a pas fini
        gsap.set(clone974El, { x: mapX, y: mapY, scale: mobile ? 0.4 : 0.5, opacity: 1 });

        const burstTl = gsap.timeline();
        activeBurstTl = burstTl;

        // Explosion du clone
        burstTl.to(clone974El, {
          scale: mobile ? 1.8 : 2.2,
          opacity: 0,
          duration: 0.38,
          ease: 'power3.in',
        });

        // Flash radial
        if (flashEl) {
          burstTl.fromTo(
            flashEl,
            { scale: 0, opacity: 0.95 },
            { scale: 5, opacity: 0, duration: 0.5, ease: 'expo.out' },
            '<',
          );
        }

        // Magnets s'envolent vers leurs cibles
        magnetsEls.forEach((el, i) => {
          const communeId = el.dataset.communeId!;
          const commune   = communeMap.get(communeId);
          const target    = getTargetPos(communeId);
          const offset    = 0.18 + (i / total) * 0.35;

          burstTl
            .to(el, {
              x: target.x,
              y: target.y,
              scale: 1,
              opacity: 1,
              rotation: commune?.mapTarget.rotation ?? 0,
              duration: 0.45,
              ease: 'power2.out',
            }, offset)
            .to(el, { scale: 1.12, duration: 0.06, ease: 'power3.in' }, '>')
            .to(el, { scale: 1,    duration: 0.1,  ease: 'elastic.out(1.2, 0.3)' }, '>');
        });
      };

      ScrollTrigger.create({
        trigger: fridgeSectionEl,
        start: 'top center',
        onEnter:     playBurst,   // burst quand on descend
        onLeaveBack: resetAll,    // reset quand on remonte au-dessus
      });
    });

    return () => ctx.revert();
  }, [mounted]);

  if (!mounted) return null;

  const magnetSize = isMobileRef.current ? 44 : 70;

  return createPortal(
    <div className="pointer-events-none absolute inset-0 z-40" aria-hidden>

      {/* Clone du 974 qui descend */}
      <div id="flying-974-clone" className="absolute top-0 left-0">
        <Image
          src="/images/magnets/magnet-974.webp"
          alt=""
          width={825}
          height={810}
          className="w-[220px] md:w-[280px] h-auto drop-shadow-2xl"
        />
      </div>

      {/* Flash d'explosion */}
      <div
        id="flying-flash"
        className="absolute top-0 left-0 rounded-full pointer-events-none"
        style={{
          width: 180,
          height: 180,
          background: 'radial-gradient(circle, rgba(255,215,30,0.98) 0%, rgba(255,90,0,0.55) 40%, transparent 70%)',
        }}
      />

      {/* Petits magnets */}
      {mapMagnets.map((commune) => (
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
