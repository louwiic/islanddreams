import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getProductBySlug } from '@/lib/actions/products';
import { ProductForm } from '@/components/ui/ProductForm';
import { ProductGallery } from '@/components/ui/ProductGallery';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: 'Produit introuvable' };

  const title = product.meta_title || `${product.name} | Island Dreams — Souvenirs de La Réunion`;
  const description =
    product.meta_description ||
    product.short_description ||
    `${product.name} — Souvenir illustré de La Réunion par Island Dreams.`;

  const mainImage = product.images.find((i) => i.is_main) ?? product.images[0];

  return {
    title,
    description,
    alternates: { canonical: `/boutique/${slug}` },
    openGraph: {
      title: product.meta_title || `${product.name} | Island Dreams`,
      description,
      locale: 'fr_RE',
      type: 'article',
      images: mainImage ? [{ url: mainImage.url, alt: mainImage.alt || product.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.meta_title || product.name,
      description,
      images: mainImage ? [mainImage.url] : undefined,
    },
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  magnets: 'Magnets',
  stickers: 'Stickers',
  textile: 'Textile',
  goodies: 'Goodies',
  decoration: 'Décoration',
};

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const mainImage = product.images.find((i) => i.is_main) ?? product.images[0];
  const sortedImages = [
    ...product.images.filter((i) => i.is_main),
    ...product.images.filter((i) => !i.is_main).sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
  ];

  const categoryLabel = CATEGORY_LABELS[product.category ?? 'uncategorized'] ?? product.category;

  return (
    <main>
      {/* Espace pour la navbar fixe */}
      <div className="bg-jungle-800 pt-24 pb-4" />

      <div className="pb-16 px-4 pt-6 bg-cream">
        {/* Breadcrumb */}
        <nav className="max-w-6xl mx-auto flex items-center gap-2 text-sm mb-6">
          <Link href="/" className="text-ink/40 hover:text-ink transition-colors">
            Accueil
          </Link>
          <ChevronRight size={14} className="text-ink/25" />
          <Link href="/boutique" className="text-ink/40 hover:text-ink transition-colors">
            Boutique
          </Link>
          <ChevronRight size={14} className="text-ink/25" />
          <Link
            href={`/boutique?categorie=${product.category}`}
            className="text-ink/40 hover:text-ink transition-colors"
          >
            {categoryLabel}
          </Link>
          <ChevronRight size={14} className="text-ink/25" />
          <span className="text-ink font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Images */}
          <div>
            <ProductGallery images={sortedImages} productName={product.name} />
          </div>

          {/* Infos */}
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
              {CATEGORY_LABELS[product.category ?? 'uncategorized']}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-ink leading-tight">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-3">
              {product.sale_price ? (
                <>
                  <span className="text-3xl font-black text-coral-500">
                    {product.sale_price.toFixed(2)} €
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    {product.price.toFixed(2)} €
                  </span>
                </>
              ) : (
                <span className="text-3xl font-black text-jungle-700">
                  {product.price.toFixed(2)} €
                </span>
              )}
            </div>

            {product.short_description && (
              <div
                className="mt-6 text-sm text-gray-600 leading-relaxed prose prose-sm"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            )}

            {/* Stock global */}
            <div className="mt-6">
              {product.in_stock ? (
                <p className="text-sm text-jungle-600 font-medium">En stock</p>
              ) : (
                <p className="text-sm text-coral-500 font-medium">
                  Rupture de stock
                </p>
              )}
            </div>

            {/* Variantes + CTA */}
            <div className="mt-6">
              <ProductForm
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  sale_price: product.sale_price,
                  in_stock: product.in_stock,
                  image: mainImage?.url,
                }}
                attributes={product.attributes}
                variants={product.variants.map((v) => ({
                  ...v,
                  combination: v.combination as Record<string, string>,
                }))}
              />
            </div>

            {/* Description complète */}
            {product.description && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-sm font-bold text-ink uppercase tracking-wider mb-3">
                  Description
                </h2>
                <div
                  className="text-sm text-gray-600 leading-relaxed prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* JSON-LD Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.name,
              description: product.meta_description || product.short_description || '',
              image: mainImage?.url,
              sku: product.sku,
              offers: {
                '@type': 'Offer',
                url: `https://www.islanddreams.re/boutique/${product.slug}`,
                price: product.sale_price || product.price,
                priceCurrency: 'EUR',
                availability: product.in_stock
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
                seller: {
                  '@type': 'Organization',
                  name: 'Island Dreams',
                },
              },
            },
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.islanddreams.re' },
                { '@type': 'ListItem', position: 2, name: 'Boutique', item: 'https://www.islanddreams.re/boutique' },
                { '@type': 'ListItem', position: 3, name: categoryLabel, item: `https://www.islanddreams.re/boutique?categorie=${product.category}` },
                { '@type': 'ListItem', position: 4, name: product.name },
              ],
            },
          ]),
        }}
      />
    </main>
  );
}
