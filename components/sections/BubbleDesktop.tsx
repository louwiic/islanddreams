'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, registerGsapPlugins } from '@/lib/animations/gsap-setup';

type Props = { onClick: () => void };

export function BubbleDesktop({ onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();
    if (!ref.current) return;
    gsap.set(ref.current, { opacity: 0, x: 60 });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: '#fridge-door',
        start: 'top 70%',
        once: true,
        onEnter: () => {
          gsap.to(ref.current, { opacity: 1, x: 0, duration: 0.35, ease: 'power3.out', delay: 0.4 });
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className="hidden md:block absolute -right-[220px] top-[22%] cursor-pointer hover:scale-105 transition-transform z-50"
    >
      <div className="relative bg-white rounded-2xl px-5 py-4 shadow-xl border-2 border-ink max-w-[260px]">
        <p className="text-ink font-bold text-sm leading-snug text-center">
          Island Dreams propose des souvenirs et des designs exclusifs à l&apos;effigie de la Réunion. Stickers, magnets, serviettes, tapis et autres..
        </p>
        <div
          className="absolute top-1/2 -left-3 w-6 h-6 bg-white border-b-2 border-l-2 border-ink"
          style={{ transform: 'translateY(-50%) rotate(45deg)' }}
        />
      </div>
    </div>
  );
}
