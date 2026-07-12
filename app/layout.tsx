import type { Metadata } from 'next';
import { Fraunces, Inter, Oswald, Londrina_Solid, Barlow_Semi_Condensed } from 'next/font/google';
import { CookieConsent } from '@/components/ui/CookieConsent';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
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
    locale: 'fr_FR',
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
              '@type': 'LocalBusiness',
              name: 'Island Dreams',
              url: 'https://www.islanddreams.re',
              logo: 'https://www.islanddreams.re/images/logo/logo-horizontal-hd.png',
              image: 'https://www.islanddreams.re/images/og-default.jpg',
              description:
                'Cadeaux personnalisés et souvenirs illustrés de La Réunion 974 — magnets, stickers, textile, décoration. Dessiné et imprimé à La Réunion.',
              telephone: '+262693056667',
              email: 'contact@islanddreams.re',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'La Réunion',
                addressRegion: 'La Réunion',
                addressCountry: 'FR',
                postalCode: '974',
              },
              areaServed: ['La Réunion', 'France métropolitaine', 'DOM-TOM'],
              sameAs: [
                'https://www.instagram.com/islanddreams.re/',
                'https://www.facebook.com/islanddreams974/',
                'https://www.tiktok.com/@islanddreams.re',
              ],
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Souvenirs et cadeaux illustrés de La Réunion',
                itemListElement: [
                  { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Magnets de La Réunion' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Stickers 974' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Textile péi' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Décoration réunionnaise' } },
                ],
              },
            }),
          }}
        />
        <LanguageProvider>
          {children}
          <CookieConsent />
        </LanguageProvider>
      </body>
    </html>
  );
}
