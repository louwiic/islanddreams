import type { Metadata } from 'next';
import { Fraunces, Inter, Oswald } from 'next/font/google';
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

export const metadata: Metadata = {
  title: "Island Dreams — L'île en souvenirs",
  description:
    'Des objets qui racontent La Réunion. Magnets, stickers, textile, décoration — un bout de péi à garder, à offrir.',
  openGraph: {
    title: "Island Dreams — L'île en souvenirs",
    description: 'Un bout de péi à garder, à offrir.',
    locale: 'fr_RE',
    type: 'website',
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
      className={`${fraunces.variable} ${inter.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
