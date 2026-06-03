import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock, Tag } from 'lucide-react';
import { getPublishedPostBySlug, getRecentPosts } from '@/lib/actions/blog';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: 'Article introuvable' };

  return {
    title: post.meta_title || `${post.title} — Island Dreams`,
    description: post.meta_description || post.excerpt || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || undefined,
      images: post.cover_image_url ? [{ url: post.cover_image_url, width: 1200, height: 630 }] : undefined,
      type: 'article',
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || undefined,
      authors: [post.author],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const [post, recentPosts] = await Promise.all([
    getPublishedPostBySlug(slug),
    getRecentPosts(3),
  ]);

  if (!post) notFound();

  const cat = (post as Record<string, unknown>).blog_categories as { name: string; slug: string } | null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    image: post.cover_image_url || undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { '@type': 'Organization', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'Island Dreams',
      logo: { '@type': 'ImageObject', url: 'https://www.islanddreams.re/images/logo/logo-horizontal-hd.png' },
    },
    description: post.meta_description || post.excerpt,
  };

  return (
    <main className="bg-cream min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-jungle-800 pt-28 pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-jungle-300 text-sm hover:text-cream transition-colors mb-4">
            <ArrowLeft size={14} />
            Retour au blog
          </Link>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 -mt-2">
        {/* Image couverture */}
        {post.cover_image_url && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 shadow-lg">
            <Image
              src={post.cover_image_url}
              alt={post.cover_image_alt || post.title}
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {cat && (
            <Link href={`/blog?categorie=${cat.slug}`} className="px-3 py-1 rounded-full bg-jungle-100 text-jungle-700 text-xs font-bold uppercase tracking-wider hover:bg-jungle-200 transition-colors">
              {cat.name}
            </Link>
          )}
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={12} />
            {post.published_at && new Date(post.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          {post.updated_at && post.updated_at !== post.published_at && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              · Mis à jour le {new Date(post.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
          <span className="text-xs text-gray-400">par {post.author}</span>
        </div>

        {/* Titre */}
        <h1 className="text-3xl md:text-4xl font-black text-ink leading-tight mb-8">
          {post.title}
        </h1>

        {/* Contenu */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-ink prose-headings:font-bold prose-a:text-jungle-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl mb-10"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12 pt-6 border-t border-gray-200">
            <Tag size={14} className="text-gray-400 mt-0.5" />
            {post.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* Articles récents */}
      {recentPosts.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <h2 className="text-lg font-bold text-ink mb-6">Articles récents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentPosts
              .filter((p) => p.slug !== slug)
              .slice(0, 3)
              .map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative aspect-video bg-gray-100">
                      {p.cover_image_url && (
                        <Image src={p.cover_image_url} alt="" fill className="object-cover" sizes="300px" />
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-ink group-hover:text-jungle-600 transition-colors line-clamp-2">
                        {p.title}
                      </h3>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {p.published_at && new Date(p.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      )}
    </main>
  );
}
