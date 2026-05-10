import Link from 'next/link';
import { Plus, Search, FileText, Clock, Star } from 'lucide-react';
import { getBlogPosts } from '@/lib/actions/blog';

export default async function AdminBlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un article..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 bg-white"
            />
          </div>
        </div>
        <Link
          href="/admin/blog/nouveau"
          className="flex items-center gap-2 px-4 py-2.5 bg-jungle-600 text-white rounded-lg text-sm font-medium hover:bg-jungle-700 transition-colors"
        >
          <Plus size={16} />
          Nouvel article
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-ink">Aucun article</h3>
            <p className="text-xs text-gray-400 mt-1">Commencez par créer votre premier article de blog.</p>
            <Link href="/admin/blog/nouveau" className="inline-block mt-4 px-4 py-2 text-sm font-medium text-white bg-jungle-600 rounded-lg hover:bg-jungle-700">
              Créer un article
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="px-5 py-3 font-medium">Article</th>
                    <th className="px-5 py-3 font-medium">Catégorie</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {posts.map((post) => {
                    const cat = (post as Record<string, unknown>).blog_categories as { name: string } | null;
                    return (
                      <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <Link href={`/admin/blog/${post.id}`} className="flex items-center gap-3 group">
                            {post.cover_image_url ? (
                              <div className="w-12 h-8 rounded bg-gray-100 overflow-hidden relative shrink-0">
                                <img src={post.cover_image_url} alt="" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-12 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0">
                                <FileText size={14} className="text-gray-400" />
                              </div>
                            )}
                            <div>
                              <span className="text-sm font-medium text-ink group-hover:text-jungle-600 transition-colors">
                                {post.title}
                              </span>
                              {post.featured && <Star size={12} className="inline ml-1.5 text-sun-500 fill-sun-500" />}
                              {post.excerpt && (
                                <p className="text-[11px] text-gray-400 line-clamp-1">{post.excerpt}</p>
                              )}
                            </div>
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-500">
                          {cat?.name || '—'}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={11} />
                            {post.published_at
                              ? new Date(post.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                              : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                            post.status === 'publish' ? 'bg-jungle-50 text-jungle-600' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {post.status === 'publish' ? 'Publié' : 'Brouillon'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">{posts.length} article{posts.length > 1 ? 's' : ''}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
