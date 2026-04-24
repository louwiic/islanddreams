// FooterNarratif — style Candia, couleurs Island Dreams

import Link from 'next/link';
import Image from 'next/image';

const NAV_LINKS = [
  { label: 'BOUTIQUE',             href: 'https://www.islanddreams.re/boutique/' },
  { label: 'À PROPOS',             href: 'https://www.islanddreams.re/a-propos/' },
  { label: 'DÉCOUVRIR LA RÉUNION', href: 'https://www.islanddreams.re/decouvrir-la-reunion/' },
  { label: 'CONTACT',              href: 'https://www.islanddreams.re/contact/' },
];

const LEGAL_LINKS = [
  { label: 'Mentions légales',             href: 'https://www.islanddreams.re/mentions-legales/' },
  { label: 'Politique de confidentialité', href: 'https://www.islanddreams.re/politique-de-cookies-ue/' },
  { label: 'CGV',                          href: 'https://www.islanddreams.re/wp-content/uploads/2025/12/CGV-ISLAND-DREAMS.pdf' },
];

function SocialBtn({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-10 h-10 rounded-full bg-cream/15 text-cream flex items-center justify-center hover:bg-sun-400 hover:text-ink transition-colors"
    >
      {children}
    </a>
  );
}

// Bord déchiré SVG
function TornEdge({ fromColor, toColor }: { fromColor: string; toColor: string }) {
  return (
    <div className="w-full leading-none block" style={{ backgroundColor: toColor, lineHeight: 0 }} aria-hidden>
      <svg viewBox="0 0 1440 32" preserveAspectRatio="none" className="w-full block" style={{ height: 32, display: 'block' }}>
        <path
          fill={fromColor}
          d="M0,0 L0,18 C40,26 80,10 120,18 C160,26 200,8 240,16 C280,24 320,6 360,14 C400,22 440,8 480,16 C520,24 560,6 600,14 C640,22 680,10 720,18 C760,26 800,8 840,16 C880,24 920,6 960,14 C1000,22 1040,10 1080,18 C1120,26 1160,8 1200,16 C1240,24 1280,6 1320,14 C1360,22 1400,10 1440,18 L1440,0 Z"
        />
      </svg>
    </div>
  );
}

export function FooterNarratif() {
  return (
    <footer>
      {/* Bord déchiré : section précédente (cream) → footer teal */}
      <TornEdge fromColor="#f5efe0" toColor="#0D6B75" />

      {/* ── Corps principal : fond teal Island Dreams ─────────────── */}
      <div className="bg-jungle-600">
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-6 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 items-center">

          {/* ── Gauche : logo + socials + CTA ── */}
          <div className="flex flex-col items-center gap-5">
            <Link href="/" aria-label="Island Dreams — Accueil">
              <Image
                src="/images/logo.png"
                alt="Island Dreams"
                width={160}
                height={64}
                className="h-14 w-auto object-contain brightness-0 invert"
              />
            </Link>

            <p className="text-cream/50 text-sm italic text-center">
              Zot vil, zot fiérté péi.
            </p>

            <div className="flex gap-2">
              <SocialBtn href="https://www.facebook.com/profile.php?id=61553257432359" label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </SocialBtn>
              <SocialBtn href="https://www.instagram.com/islanddreams.re/" label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /></svg>
              </SocialBtn>
              <SocialBtn href="https://www.tiktok.com/@islanddreams.re" label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" /></svg>
              </SocialBtn>
            </div>

            <a
              href="https://www.islanddreams.re/boutique/"
              className="inline-block bg-sun-400 text-ink text-sm font-bold px-6 py-2.5 rounded-full hover:bg-sun-300 transition-colors tracking-wide"
            >
              Voir la boutique
            </a>
          </div>

          {/* ── Centre : navigation ── */}
          <nav className="flex flex-col items-center gap-5" aria-label="Footer navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-cream font-black text-xl md:text-2xl uppercase tracking-wide hover:text-sun-400 transition-colors leading-none"
                style={{ fontFamily: 'var(--font-heading, serif)' }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* ── Droite : badge + socials + CTA ── */}
          <div className="flex flex-col items-center gap-5">
            {/* Badge 974 */}
            <div className="w-20 h-20 rounded-full border-4 border-sun-400 flex items-center justify-center">
              <span
                className="text-sun-400 font-black text-2xl leading-none"
                style={{ fontFamily: 'var(--font-heading, serif)' }}
              >
                974
              </span>
            </div>

            <div className="flex flex-col items-center gap-1 text-sm text-cream/60">
              <a href="tel:0693056667" className="hover:text-sun-400 transition-colors font-medium">
                0693 05 66 67
              </a>
              <a href="mailto:contact@islanddreams.re" className="hover:text-sun-400 transition-colors font-medium">
                contact@islanddreams.re
              </a>
            </div>

            <div className="flex gap-2">
              <SocialBtn href="https://www.facebook.com/profile.php?id=61553257432359" label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </SocialBtn>
              <SocialBtn href="https://www.instagram.com/islanddreams.re/" label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /></svg>
              </SocialBtn>
              <SocialBtn href="https://www.tiktok.com/@islanddreams.re" label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" /></svg>
              </SocialBtn>
            </div>

            <a
              href="https://www.islanddreams.re/contact/"
              className="inline-block border-2 border-cream/40 text-cream text-sm font-bold px-6 py-2.5 rounded-full hover:border-sun-400 hover:text-sun-400 transition-colors tracking-wide"
            >
              Nous contacter
            </a>
          </div>
        </div>

        {/* ── Ligne légale ── */}
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-cream/30 border-t border-cream/10">
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            {LEGAL_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-cream transition-colors">
                {l.label}
              </a>
            ))}
          </div>
          <p>Un site fait à La Réunion (974). 2025 Island Dreams.</p>
        </div>
      </div>

      {/* ── Bande très sombre en bas ── */}
      <div className="bg-jungle-800 text-cream/70 text-center py-5 px-6">
        <p className="font-black uppercase tracking-wider text-sm mb-1 text-cream"
           style={{ fontFamily: 'var(--font-heading, serif)' }}>
          Des souvenirs pensés, dessinés et imprimés à La Réunion.
        </p>
        <p className="text-cream/50 text-xs">
          Livraison France métropolitaine &amp; DOM · contact@islanddreams.re
        </p>
      </div>
    </footer>
  );
}
