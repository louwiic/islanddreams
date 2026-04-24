'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartButton } from './CartButton';

type NavFeaturedCategory = {
  slug: string;
  name: string;
  nav_label: string | null;
  nav_color: string | null;
} | null;

const leftLinks = [
  { label: 'Accueil', href: '/' },
  { label: 'Boutique', href: '/boutique' },
];

const rightLinks = [
  { label: 'À propos', href: '/a-propos' },
  { label: 'Découvrir la Réunion', href: '/decouvrir' },
  { label: 'Contact', href: '/contact' },
];

export function Navbar({
  featuredCategory,
}: {
  featuredCategory?: NavFeaturedCategory;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Liens gauche : catégorie spéciale en premier si elle existe
  const leftNav = featuredCategory
    ? [
        {
          label: featuredCategory.nav_label || featuredCategory.name,
          href: `/boutique/${featuredCategory.slug}`,
          color: featuredCategory.nav_color,
          featured: true,
        },
        ...leftLinks.map((l) => ({ ...l, color: null, featured: false })),
      ]
    : leftLinks.map((l) => ({ ...l, color: null, featured: false }));

  const allMobileLinks = [
    ...leftNav,
    ...rightLinks.map((l) => ({ ...l, color: null, featured: false })),
  ];

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-jungle-600/97 backdrop-blur-md shadow-lg py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Liens gauche — desktop */}
        <div className="hidden lg:flex items-center gap-10 flex-1">
          {leftNav.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-[13px] font-bold uppercase tracking-[0.25em] transition-colors duration-300 relative group ${
                link.featured
                  ? 'text-white'
                  : 'nav-link text-cream/90 hover:text-sun-400'
              }`}
            >
              {link.featured ? (
                <span
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-bold tracking-[0.2em] transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: link.color ?? '#e84c3d',
                  }}
                >
                  {link.label}
                </span>
              ) : (
                <>
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-sun-400 transition-all duration-300 group-hover:w-full" />
                </>
              )}
            </Link>
          ))}
        </div>

        {/* Logo central */}
        <Link href="/" className="flex-shrink-0 relative">
          <Image
            src="/images/logo/island-dreams-horizontal.webp"
            alt="Island Dreams"
            width={220}
            height={60}
            priority
            className={`transition-all duration-500 brightness-0 invert ${
              scrolled ? 'h-8 md:h-10 w-auto' : 'h-10 md:h-14 w-auto'
            }`}
          />
        </Link>

        {/* Liens droite — desktop */}
        <div className="hidden lg:flex items-center justify-end gap-10 flex-1">
          {rightLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="nav-link text-cream/90 hover:text-sun-400 text-[13px] font-bold uppercase tracking-[0.25em] transition-colors duration-300 relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-sun-400 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          <CartButton />
        </div>

        {/* Panier + Burger — mobile */}
        <div className="lg:hidden flex items-center gap-1">
          <CartButton />
        </div>
        <button
          className="lg:hidden flex flex-col gap-[5px] p-2 group"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          <span
            className={`block w-6 h-[2px] bg-cream transition-all duration-300 ${
              mobileOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`block w-6 h-[2px] bg-cream transition-all duration-300 ${
              mobileOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-[2px] bg-cream transition-all duration-300 ${
              mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </div>

      {/* Menu mobile */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-400 ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pt-4 pb-6 flex flex-col gap-4 bg-jungle-600/97 backdrop-blur-md">
          {allMobileLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-sm font-bold uppercase tracking-[0.25em] transition-colors duration-300 py-1 ${
                link.featured
                  ? 'text-white'
                  : 'text-cream/90 hover:text-sun-400'
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.featured ? (
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-[12px]"
                  style={{ backgroundColor: link.color ?? '#e84c3d' }}
                >
                  {link.label}
                </span>
              ) : (
                link.label
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
