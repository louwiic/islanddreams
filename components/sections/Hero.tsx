// Section Hero — les souvenirs de La Réunion

'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap, ScrollTrigger, registerGsapPlugins } from '@/lib/animations/gsap-setup';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function Hero() {
  const { t } = useLanguage();
  const heroRef   = useRef<HTMLElement>(null);
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
        src="/images/hero/island-dreams-souvenirs-974.webp"
        alt={t('home.hero.alt')}
        fill
        sizes="100vw"
        preload
        className="object-cover object-[65%_center] md:object-center"
      />

      {/* Overlay pour lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-r from-jungle-900/80 via-jungle-900/25 to-transparent md:via-jungle-900/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-jungle-900/45 via-transparent to-jungle-900/10" />

      {/* Magnet 974 animé — au-dessus du titre */}
      <div className="absolute left-[28%] top-[5%] z-20 md:left-[20%] md:top-[14%]">
        <div
          ref={magnetRef}
          id="hero-magnet-974"
          aria-label={t('home.hero.magnetLabel')}
        >
          <div
            className="magnet-flash absolute inset-0 rounded-full bg-white opacity-0 blur-2xl pointer-events-none"
            style={{ transform: 'scale(1.5)' }}
          />
          <div
            className="magnet-glow absolute inset-0 rounded-full opacity-50 blur-3xl"
            style={{
              background:
                'radial-gradient(circle, var(--color-sun-300) 0%, transparent 70%)',
              transform: 'scale(1.8)',
            }}
          />
          <Image
            src="/images/magnets/magnet-974.webp"
            alt={t('home.hero.magnetLabel')}
            width={825}
            height={810}
            sizes="(max-width: 767px) 104px, (max-width: 1023px) 144px, 176px"
            className="relative h-auto w-[104px] drop-shadow-2xl md:w-36 lg:w-44"
            loading="eager"
          />
        </div>
      </div>

      {/* Contenu éditorial */}
      <div className="absolute left-0 top-[18%] z-10 w-[78%] max-w-xl px-5 sm:px-8 md:left-[6%] md:top-1/2 md:w-[46%] md:-translate-y-1/2 md:px-0 lg:max-w-2xl">
        <h1 className="title-chunky-light text-[2.75rem] leading-[0.88] sm:text-6xl md:text-7xl lg:text-[5.6rem]">
          LES SOUVENIRS
          <br />DE LA RÉUNION
        </h1>
        <p className="mt-5 text-lg font-semibold text-white drop-shadow-lg sm:text-xl md:text-2xl">
          À collectionner. À offrir. À emporter.
        </p>
        <p className="mt-2 text-sm font-medium uppercase tracking-[0.08em] text-cream/90 drop-shadow-md sm:text-base md:text-lg">
          Magnets · Stickers · Déco · Textile · Cadeaux
        </p>
        <Link
          href="/boutique"
          className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-flamboyant px-6 py-3 font-[family-name:var(--font-oswald)] text-sm font-bold uppercase tracking-[0.08em] text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-coral-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:px-8 sm:text-base"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 8h12l-1 12H7L6 8Zm3 0V6a3 3 0 0 1 6 0v2" />
          </svg>
          Découvrir la boutique
          <span aria-hidden="true">→</span>
        </Link>
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
