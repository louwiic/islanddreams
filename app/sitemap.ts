import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

const BASE_URL = 'https://www.islanddreams.re';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();

  // Produits publiés
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('status', 'publish')
    .order('updated_at', { ascending: false });

  // Catégories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at');

  const productUrls = (products ?? []).map((p) => ({
    url: `${BASE_URL}/boutique/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryUrls = (categories ?? []).map((c) => ({
    url: `${BASE_URL}/boutique?categorie=${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const staticPages = [
    { path: '/decouvrir-la-reunion', priority: 0.7 },
    { path: '/a-propos', priority: 0.5 },
    { path: '/contact', priority: 0.5 },
    { path: '/mentions-legales', priority: 0.3 },
    { path: '/politique-de-confidentialite', priority: 0.3 },
    { path: '/politique-de-cookies', priority: 0.3 },
    { path: '/cgv', priority: 0.3 },
  ].map((p) => ({
    url: `${BASE_URL}${p.path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: p.priority,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/boutique`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...productUrls,
    ...categoryUrls,
    ...staticPages,
  ];
}
