import { notFound } from 'next/navigation';
import { BlogPostForm } from '@/components/admin/BlogPostForm';
import { getBlogPostById } from '@/lib/actions/blog';

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getBlogPostById(id);
  if (!post) notFound();

  return (
    <BlogPostForm
      mode="edit"
      initialData={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? '',
        content: post.content ?? '',
        coverImageUrl: post.cover_image_url ?? '',
        coverImageAlt: post.cover_image_alt ?? '',
        categoryId: post.category_id ?? '',
        tags: post.tags ?? [],
        status: post.status ?? 'draft',
        featured: post.featured ?? false,
        publishedAt: post.published_at ?? '',
        author: post.author ?? 'Island Dreams',
        metaTitle: post.meta_title ?? '',
        metaDescription: post.meta_description ?? '',
        focusKeyword: post.focus_keyword ?? '',
      }}
    />
  );
}
