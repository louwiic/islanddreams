'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, registerGsapPlugins } from '@/lib/animations/gsap-setup';

type Props = { onClick: () => void };

export function BubbleMobile({ onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();
    if (!ref.current) return;
    gsap.set(ref.current, { opacity: 0, y: 30 });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: '#fridge-door',
        start: 'bottom 85%',
        once: true,
        onEnter: () => {
          gsap.to(ref.current, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)', delay: 0.2 });
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className="md:hidden mt-6 mx-auto cursor-pointer hover:scale-105 transition-transform z-50 w-fit"
    >
      <div className="relative bg-white rounded-2xl px-4 py-3 shadow-xl border-2 border-ink max-w-[280px]">
        {/* Pointeur vers le haut → carte */}
        <div
          className="absolute -top-[13px] left-1/2 w-6 h-6 bg-white border-t-2 border-l-2 border-ink"
          style={{ transform: 'translateX(-50%) rotate(45deg)' }}
        />
        <p className="text-ink font-bold text-xs leading-snug text-center">
          Island Dreams propose des souvenirs et des designs exclusifs à l&apos;effigie de la Réunion. Stickers, magnets, serviettes, tapis et autres..
        </p>
      </div>
    </div>
  );
}
