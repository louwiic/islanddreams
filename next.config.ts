import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '60mb',
    },
  },
  async redirects() {
    return [
      // Anciennes URLs WordPress → nouvelles routes
      {
        source: '/produit/:slug*',
        destination: '/boutique/:slug*',
        permanent: true,
      },
      {
        source: '/categorie-produit/:slug*',
        destination: '/boutique',
        permanent: true,
      },
      // Anciennes pages légales WordPress
      {
        source: '/politique-de-cookies-ue',
        destination: '/politique-de-cookies',
        permanent: true,
      },
      // Liens courts
      {
        source: '/go/avis',
        destination: '/avis',
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'islanddreams.pgbase-qtpcyjvnucq8wrzs0wjw8znp.137.74.171.48.sslip.io',
        pathname: '/storage/objects/**',
      },
      {
        protocol: 'https',
        hostname: 'www.islanddreams.re',
        pathname: '/wp-content/uploads/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60, // Les photos récupérées doivent remplacer rapidement les visuels d’attente
  },
};

export default nextConfig;
