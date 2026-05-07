import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page introuvable — Island Dreams 974',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="bg-cream min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p
          className="text-8xl font-black text-jungle-200 mb-4"
          style={{ fontFamily: 'var(--font-heading, serif)' }}
        >
          404
        </p>
        <h1
          className="text-2xl font-black text-ink uppercase tracking-wide mb-3"
          style={{ fontFamily: 'var(--font-heading, serif)' }}
        >
          Page introuvable
        </h1>
        <p className="text-ink/60 mb-8">
          Cette page n&apos;existe pas ou a été déplacée. Pas de panique, l&apos;île est toujours là !
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-jungle-700 text-cream text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-jungle-800 transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/boutique"
            className="px-6 py-3 border-2 border-jungle-700 text-jungle-700 text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-jungle-50 transition-colors"
          >
            Voir la boutique
          </Link>
        </div>
      </div>
    </main>
  );
}
