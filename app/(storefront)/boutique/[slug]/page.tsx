import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getProductBySlug } from '@/lib/actions/products';
import { AddToCartButton } from '@/components/ui/AddToCartButton';

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
    openGraph: {
      title: product.meta_title || `${product.name} | Island Dreams`,
      description,
      locale: 'fr_RE',
      type: 'website',
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
  const gallery = product.images.filter((i) => !i.is_main);

  const categoryLabel = CATEGORY_LABELS[product.category ?? 'uncategorized'] ?? product.category;

  return (
    <main>
      {/* Bandeau navbar + breadcrumb */}
      <div className="bg-jungle-800 pt-24 pb-6 px-4">
        <nav className="max-w-6xl mx-auto flex items-center gap-2 text-sm">
          <Link href="/" className="text-cream/60 hover:text-cream transition-colors">
            Accueil
          </Link>
          <ChevronRight size={14} className="text-cream/30" />
          <Link href="/boutique" className="text-cream/60 hover:text-cream transition-colors">
            Boutique
          </Link>
          <ChevronRight size={14} className="text-cream/30" />
          <Link
            href={`/boutique?categorie=${product.category}`}
            className="text-cream/60 hover:text-cream transition-colors"
          >
            {categoryLabel}
          </Link>
          <ChevronRight size={14} className="text-cream/30" />
          <span className="text-cream font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>
      </div>

      <div className="pb-16 px-4 pt-8 bg-cream">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Images */}
          <div>
            {mainImage && (
              <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-100 mb-4">
                <Image
                  src={mainImage.url}
                  alt={mainImage.alt || product.name}
                  fill
                  className="object-contain p-6"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            )}
            {gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {gallery.map((img) => (
                  <div
                    key={img.id}
                    className="aspect-square relative rounded-lg overflow-hidden bg-gray-100"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || product.name}
                      fill
                      className="object-contain p-2"
                      sizes="12vw"
                    />
                  </div>
                ))}
              </div>
            )}
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

            {/* Variantes */}
            {product.variants.length > 0 && (
              <div className="mt-6 space-y-3">
                {product.attributes.map((attr) => (
                  <div key={attr.id}>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {attr.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {attr.values.map((val) => (
                        <button
                          key={val}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:border-jungle-500 transition-colors"
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stock */}
            <div className="mt-6">
              {product.in_stock ? (
                <p className="text-sm text-jungle-600 font-medium">En stock</p>
              ) : (
                <p className="text-sm text-coral-500 font-medium">
                  Rupture de stock
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="mt-6">
              <AddToCartButton
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  salePrice: product.sale_price,
                  image: mainImage?.url,
                  inStock: product.in_stock ?? true,
                }}
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
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.meta_description || product.short_description || '',
            image: mainImage?.url,
            sku: product.sku,
            offers: {
              '@type': 'Offer',
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
          }),
        }}
      />
    </main>
  );
}
