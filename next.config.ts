import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
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
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sgxilglkeupxpnzkzqfq.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'www.islanddreams.re',
        pathname: '/wp-content/uploads/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 jours de cache
  },
};

export default nextConfig;
