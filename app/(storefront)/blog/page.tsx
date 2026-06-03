import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { getPublishedPosts, getBlogCategories } from '@/lib/actions/blog';

export const metadata: Metadata = {
  title: 'Blog — Island Dreams | Souvenirs de La Réunion',
  description: "Actualités, coulisses et conseils autour de La Réunion et des créations Island Dreams. Découvrez notre île à travers nos articles.",
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog — Island Dreams | Souvenirs de La Réunion',
    description: "Actualités, coulisses et conseils autour de La Réunion et des créations Island Dreams.",
    locale: 'fr_FR',
    type: 'website',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630, alt: 'Island Dreams — Blog' }],
  },
  twitter: { card: 'summary_large_image' },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const { categorie } = await searchParams;
  const [posts, categories] = await Promise.all([
    getPublishedPosts(categorie),
    getBlogCategories(),
  ]);

  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => p.id !== featured?.id);

  return (
    <main className="bg-cream min-h-screen">
      <div className="bg-jungle-800 pt-28 pb-12 px-4 text-center">
        <p className="text-jungle-300 text-sm font-medium uppercase tracking-widest mb-3">
          Island Dreams · 974
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-cream mb-3 leading-tight">
          Nout Blog
        </h1>
        <p className="text-jungle-200 text-base max-w-xl mx-auto">
          Zistoir péi, coulisses et conseils autour de La Réunion
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Filtres catégories */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/blog"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !categorie ? 'bg-jungle-700 text-cream' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Tous
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/blog?categorie=${cat.slug}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                categorie === cat.slug ? 'bg-jungle-700 text-cream' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">Aucun article pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Article à la une */}
            {featured && (
              <Link href={`/blog/${featured.slug}`} className="block group">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden md:flex">
                  <div className="relative md:w-1/2 aspect-video md:aspect-auto">
                    {featured.cover_image_url ? (
                      <Image
                        src={featured.cover_image_url}
                        alt={featured.cover_image_alt || featured.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="w-full h-full min-h-[200px] bg-jungle-100" />
                    )}
                  </div>
                  <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-center">
                    {(() => {
                      const cat = (featured as Record<string, unknown>).blog_categories as { name: string } | null;
                      return cat && (
                        <span className="text-xs font-bold text-jungle-600 uppercase tracking-wider mb-2">{cat.name}</span>
                      );
                    })()}
                    <h2 className="text-xl md:text-2xl font-bold text-ink group-hover:text-jungle-600 transition-colors mb-3">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="text-sm text-gray-500 line-clamp-3 mb-4">{featured.excerpt}</p>
                    )}
                    <span className="text-xs text-gray-400 flex items-center gap-1 mt-auto">
                      <Clock size={12} />
                      {featured.published_at && new Date(featured.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grille articles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post) => {
                const cat = (post as Record<string, unknown>).blog_categories as { name: string } | null;
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative aspect-video bg-gray-100">
                        {post.cover_image_url ? (
                          <Image
                            src={post.cover_image_url}
                            alt={post.cover_image_alt || post.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-jungle-50" />
                        )}
                      </div>
                      <div className="p-4">
                        {cat && (
                          <span className="text-[10px] font-bold text-jungle-600 uppercase tracking-wider">{cat.name}</span>
                        )}
                        <h3 className="text-sm font-bold text-ink group-hover:text-jungle-600 transition-colors mt-1 line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{post.excerpt}</p>
                        )}
                        <span className="text-[10px] text-gray-400 mt-3 flex items-center gap-1">
                          <Clock size={10} />
                          {post.published_at && new Date(post.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
