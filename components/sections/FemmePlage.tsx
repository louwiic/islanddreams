'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { gsap, ScrollTrigger, registerGsapPlugins } from '@/lib/animations/gsap-setup';

export function FemmePlage() {
  const [mounted, setMounted] = useState(false);
  const isMobileRef = useRef(false);

  useEffect(() => {
    isMobileRef.current = window.innerWidth < 768;
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    registerGsapPlugins();

    const ctx = gsap.context(() => {
      const womanEl     = document.getElementById('femme-plage-char');
      const carouselEl  = document.getElementById('product-carousel');
      const servietteEl = document.getElementById('serviette-section');
      const revealEl  = document.getElementById('serviette-reveal');
      const flashEl   = document.getElementById('serviette-flash');
      const bubbleEl  = document.getElementById('serviette-bubble');
      const msg1El    = document.getElementById('bubble-msg-1');
      const msg2El    = document.getElementById('bubble-msg-2');
      const card1     = document.getElementById('textile-card-1');
      const card2     = document.getElementById('textile-card-2');
      const card3     = document.getElementById('textile-card-3');

      if (!womanEl || !carouselEl || !servietteEl) return;

      const mobile = isMobileRef.current;

      // Position initiale de la femme allongée
      const cr = carouselEl.getBoundingClientRect();
      const sy = window.scrollY;
      gsap.set(womanEl, {
        x: window.innerWidth / 2,
        y: cr.bottom + sy - (mobile ? 50 : 70),
        xPercent: -50,
        yPercent: -50,
        opacity: 1,
        scale: mobile ? 0.75 : 0.95,
      });

      // États initiaux
      if (revealEl) gsap.set(revealEl, { opacity: 0, scale: 0.5, rotation: -8, y: 30 });
      if (flashEl)  gsap.set(flashEl,  { opacity: 0, scale: 1 });
      if (bubbleEl) gsap.set(bubbleEl, { opacity: 0, scale: 0, transformOrigin: 'bottom left' });
      if (msg2El)   gsap.set(msg2El,   { opacity: 0 });
      [card1, card2, card3].forEach(c => c && gsap.set(c, { opacity: 0, scale: 0.7 }));

      // ── Séquence magique complète ─────────────────────────────────
      const playMagic = () => {
        if (!revealEl) return;
        const tl = gsap.timeline();

        // 1. Flash
        if (flashEl) {
          tl.to(flashEl, { opacity: 0.85, scale: 1.6, duration: 0.18, ease: 'power4.out' })
            .to(flashEl, { opacity: 0, scale: 2.4, duration: 0.45, ease: 'power2.in' }, '>-0.05');
        }

        // 2. Serviette pop
        tl.to(revealEl, { opacity: 1, scale: 1.06, rotation: 0, y: 0, duration: 0.5, ease: 'back.out(2)' }, flashEl ? '<0.1' : 0)
          .to(revealEl, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.5)' });

        // 3. Flottement
        tl.to(revealEl, { y: mobile ? -8 : -12, rotation: 0.6, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });

        // 4. Bulle apparaît (0.4s après pop)
        if (bubbleEl) {
          tl.to(bubbleEl, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, '<0.4');
        }

        // 5. Msg1 visible (déjà dans le DOM), après 2.5s swap vers msg2
        tl.to({}, { duration: 2.5 }) // pause
          .to(msg1El, { opacity: 0, y: -6, duration: 0.25, ease: 'power2.in' })
          .to(msg2El, { opacity: 1, y: 0,  duration: 0.3,  ease: 'power2.out' }, '>-0.1');

        // 6. Après 2.5s de msg2 : bulle disparaît
        tl.to({}, { duration: 2.5 })
          .to(bubbleEl, { opacity: 0, scale: 0.8, duration: 0.3, ease: 'power2.in' });

        // 7. Fille disparaît complètement
        tl.to(revealEl, { opacity: 0, scale: 0.85, duration: 0.6, ease: 'power2.in' }, '>0.1');

        // 8. Cards popent lentement une à une de gauche à droite
        if (card1) tl.to(card1, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }, '>0.4');
        if (card2) tl.to(card2, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }, '>0.6');
        if (card3) tl.to(card3, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }, '>0.6');
      };

      const hideReveal = () => {
        [revealEl, bubbleEl, msg1El, msg2El, card1, card2, card3].forEach(el => {
          if (el) gsap.killTweensOf(el);
        });
        if (revealEl) gsap.set(revealEl, { opacity: 0, scale: 0.5, rotation: -8, y: 30 });
        if (bubbleEl) gsap.set(bubbleEl, { opacity: 0, scale: 0 });
        if (msg1El)   gsap.set(msg1El,   { opacity: 1, y: 0 });
        if (msg2El)   gsap.set(msg2El,   { opacity: 0 });
        [card1, card2, card3].forEach(c => c && gsap.set(c, { opacity: 0, scale: 0.7 }));
      };

      // ── Descente + fondu de la femme allongée (scrub) ─────────────────
      gsap.timeline({
        scrollTrigger: {
          trigger: carouselEl,
          start: 'bottom 75%',
          endTrigger: servietteEl,
          end: 'top 45%',
          scrub: 1.5,
          invalidateOnRefresh: true,
          onLeave:     playMagic,   // elle a disparu → magie
          onEnterBack: hideReveal,  // retour scroll → reset
        },
      }).to(womanEl, {
        y: `+=${mobile ? 160 : 260}`,
        opacity: 0,
        scale: mobile ? 0.4 : 0.55,
        duration: 1,
        ease: 'power2.in',
      });

      // Reset de la femme quand on remonte très haut
      ScrollTrigger.create({
        trigger: carouselEl,
        start: 'bottom 75%',
        onLeaveBack: () => {
          gsap.set(womanEl, { opacity: 1, scale: mobile ? 0.6 : 0.85, y: cr.bottom + sy - (mobile ? 50 : 70) });
        },
      });
    });

    return () => ctx.revert();
  }, [mounted]);

  if (!mounted) return null;

  const w = isMobileRef.current ? 480 : 640;

  return createPortal(
    <div
      id="femme-plage-char"
      className="pointer-events-none absolute top-0 left-0 z-30"
      aria-hidden
    >
      <Image
        src="/images/sections/femme-plage.png"
        alt=""
        width={1230}
        height={680}
        style={{ width: w, height: 'auto', mixBlendMode: 'multiply' }}
        priority
      />
    </div>,
    document.body,
  );
}
