// Section Hero — "L'île en souvenirs"
// La mémé + ti-marmaille dans la jungle, gros magnet 974 centré

'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger, registerGsapPlugins } from '@/lib/animations/gsap-setup';

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const magnetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();

    if (!magnetRef.current || !heroRef.current) return;

    // Si la page est déjà scrollée (retour navigateur), afficher direct
    if (window.scrollY > 100) {
      gsap.set(magnetRef.current, { scale: 1, rotation: 0, opacity: 1 });
    } else {
      // Animation d'entrée : rotation 360° + scale de 0 à 1
      gsap.fromTo(
        magnetRef.current,
        { scale: 0, rotation: -360, opacity: 0 },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'back.out(1.4)',
          delay: 0.3,
        }
      );
    }

    // Pas d'animation continue sur mobile (perf + batterie)
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const xTo = gsap.quickTo(magnetRef.current, 'x', {
      duration: 0.8,
      ease: 'power3.out',
    });
    const yTo = gsap.quickTo(magnetRef.current, 'y', {
      duration: 0.8,
      ease: 'power3.out',
    });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = heroRef.current!.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      xTo((e.clientX - centerX) * 0.04);
      yTo((e.clientY - centerY) * 0.04);
    };

    const floatTween = gsap.to(magnetRef.current, {
      y: '+=10',
      rotation: '+=2',
      duration: 2.4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 1.5,
    });

    // Pulse doux sur le glow derrière le magnet
    const glowEl = magnetRef.current.querySelector('.magnet-glow');
    const pulseTween = glowEl
      ? gsap.to(glowEl, {
          scale: 2.2,
          opacity: 0.7,
          duration: 1.6,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 1.5,
        })
      : null;

    // Scale au scroll — le 974 grossit puis disparaît en haut
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
    scrollTl.to(magnetRef.current, {
      scale: 1.4,
      duration: 0.6,
      ease: 'power2.in',
    });
    if (glowEl) {
      scrollTl.to(
        glowEl,
        {
          scale: 3,
          opacity: 0.9,
          duration: 0.6,
          ease: 'power2.in',
        },
        0,
      );
    }

    // Illumination quand les magnets commencent à sortir
    const flashEl = magnetRef.current.querySelector('.magnet-flash');
    ScrollTrigger.create({
      trigger: magnetRef.current,
      start: 'center 15%',
      once: true,
      onEnter: () => {
        // Flash blanc subtil
        if (flashEl) {
          gsap.fromTo(
            flashEl,
            { opacity: 0, scale: 1 },
            { opacity: 0.4, scale: 2, duration: 0.2, ease: 'power4.out' },
          );
          gsap.to(flashEl, {
            opacity: 0,
            duration: 0.5,
            delay: 0.2,
            ease: 'power2.in',
          });
        }
        // Glow modéré
        if (glowEl) {
          gsap.to(glowEl, {
            scale: 3.5,
            opacity: 0.8,
            duration: 0.3,
            ease: 'power4.out',
          });
          gsap.to(glowEl, {
            scale: 2.2,
            opacity: 0.5,
            duration: 0.8,
            delay: 0.3,
            ease: 'power2.inOut',
          });
        }
        // Shake rapide du magnet
        gsap.to(magnetRef.current, {
          x: '+=6',
          duration: 0.05,
          yoyo: true,
          repeat: 5,
          ease: 'none',
        });
      },
    });

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      floatTween.kill();
      pulseTween?.kill();
      scrollTl.kill();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100svh] w-full overflow-hidden"
    >
      {/* Illustration hero */}
      <Image
        src="/images/hero/hero3.png"
        alt="Mémé créole et ti-marmaille dans la jungle péi"
        fill
        priority
        className="object-cover object-center md:object-top"
      />

      {/* Overlay pour lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-t from-jungle-900/80 via-transparent to-jungle-900/20" />

      {/* Gros magnet 974 — centré */}
      <div
        ref={magnetRef}
        className="absolute left-1/2 top-[35%] md:top-[40%] -translate-x-1/2 -translate-y-1/2 z-20"
        id="hero-magnet-974"
        aria-label="Magnet principal 974 Île de la Réunion"
      >
        <div
          className="magnet-flash absolute inset-0 rounded-full opacity-0 bg-white blur-2xl pointer-events-none"
          style={{ transform: 'scale(1.5)' }}
        />
        <div
          className="magnet-glow absolute inset-0 rounded-full blur-3xl opacity-50"
          style={{
            background:
              'radial-gradient(circle, var(--color-sun-300) 0%, transparent 70%)',
            transform: 'scale(1.8)',
          }}
        />
        <Image
          src="/images/magnets/magnet-974.webp"
          alt="Magnet 974 Île de la Réunion"
          width={825}
          height={810}
          className="relative w-[220px] md:w-[300px] h-auto drop-shadow-2xl"
          priority
        />
      </div>

      {/* Titre */}
      <div className="absolute bottom-14 md:bottom-24 left-0 right-0 z-10 text-center px-4">
        <h1 className="title-chunky-light text-[2.8rem] leading-[0.9] md:text-7xl lg:text-8xl">
          UNE HISTOIRE,
          <br />
          UN SOUVENIR…
        </h1>
        <p className="mt-3 md:mt-4 text-cream text-base md:text-xl italic font-light drop-shadow-lg">
          On vous offre bien plus qu&apos;un souvenir.
        </p>
        <p className="mt-1 md:mt-2 text-cream/60 text-[10px] md:text-xs uppercase tracking-[0.3em]">
          Island Dreams · 974
        </p>
      </div>

      {/* Indicateur de scroll — double chevron */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-10 text-cream/80 animate-bounce">
        <svg
          className="w-10 h-10 md:w-14 md:h-14"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 7l6 6 6-6M6 13l6 6 6-6"
          />
        </svg>
      </div>
    </section>
  );
}
