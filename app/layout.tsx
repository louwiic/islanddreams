import type { Metadata } from 'next';
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
  title: "Island Dreams — L'île en souvenirs",
  description:
    'Des objets qui racontent La Réunion. Magnets, stickers, textile, décoration — un bout de péi à garder, à offrir.',
  openGraph: {
    title: "Island Dreams — L'île en souvenirs",
    description: 'Un bout de péi à garder, à offrir.',
    locale: 'fr_RE',
    type: 'website',
    siteName: 'Island Dreams',
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
              logo: 'https://www.islanddreams.re/images/logo.png',
              description: 'Souvenirs illustrés de La Réunion — magnets, stickers, textile, décoration.',
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
      </body>
    </html>
  );
}
