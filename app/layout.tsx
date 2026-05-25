import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { Fraunces, Inter, Oswald, Londrina_Solid, Barlow_Semi_Condensed } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
});

const oswald = Oswald({
  variable: '--font-oswald',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const londrina = Londrina_Solid({
  variable: '--font-londrina',
  subsets: ['latin'],
  weight: ['100', '300', '400', '900'],
  display: 'swap',
});

const barlow = Barlow_Semi_Condensed({
  variable: '--font-barlow',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.islanddreams.re'),
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  title: "Island Dreams — L'île en souvenirs",
  description:
    'Des cadeaux personnalisés et souvenirs de La Réunion 974 : magnets, stickers, textile, décoration — un bout de péi à garder, à offrir.',
  keywords: [
    'cadeau personnalisé reunion',
    'cadeau personnalisé Réunion',
    'cadeau personnalisé 974',
    'souvenir La Réunion',
    'souvenir 974',
    'boutique souvenirs Réunion',
    'magnet 974',
    'stickers Réunion',
  ],
  openGraph: {
    title: "Island Dreams — L'île en souvenirs",
    description: 'Cadeaux personnalisés et souvenirs illustrés de La Réunion 974, à garder ou à offrir.',
    locale: 'fr_RE',
    type: 'website',
    siteName: 'Island Dreams',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Island Dreams — Souvenirs illustrés de La Réunion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${inter.variable} ${oswald.variable} ${londrina.variable} ${barlow.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Island Dreams',
              url: 'https://www.islanddreams.re',
              logo: 'https://www.islanddreams.re/images/logo/logo-horizontal-hd.png',
              description:
                'Cadeaux personnalisés et souvenirs illustrés de La Réunion 974 — magnets, stickers, textile, décoration.',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'La Réunion',
                addressCountry: 'FR',
              },
              sameAs: [
                'https://www.instagram.com/islanddreams.re/',
                'https://www.facebook.com/islanddreams974/',
              ],
            }),
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
