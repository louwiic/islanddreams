'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

/* ── Types ──────────────────────────────────────────────── */

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  category_id: string | null;
  tags: string[];
  status: 'publish' | 'draft';
  featured: boolean;
  published_at: string | null;
  author: string;
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
};

/* ── Lire tous les articles (admin — inclut brouillons) ── */

export async function getBlogPosts() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, blog_categories(name, slug)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

/* ── Lire un article par ID ──────────────────────────────── */

export async function getBlogPostById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

/* ── Lire les articles publiés (storefront) ──────────────── */

export async function getPublishedPosts(categorySlug?: string) {
  const supabase = createAdminClient();
  let query = supabase
    .from('blog_posts')
    .select('*, blog_categories(name, slug)')
    .eq('status', 'publish')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });

  if (categorySlug) {
    const { data: cat } = await supabase
      .from('blog_categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    if (cat) {
      query = query.eq('category_id', cat.id);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

/* ── Lire un article publié par slug ─────────────────────── */

export async function getPublishedPostBySlug(slug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, blog_categories(name, slug)')
    .eq('slug', slug)
    .eq('status', 'publish')
    .lte('published_at', new Date().toISOString())
    .single();

  if (error) return null;
  return data;
}

/* ── Articles récents ────────────────────────────────────── */

export async function getRecentPosts(limit = 3) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('title, slug, cover_image_url, published_at, excerpt')
    .eq('status', 'publish')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit);

  return data ?? [];
}

/* ── Catégories ──────────────────────────────────────────── */

export async function getBlogCategories() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('blog_categories')
    .select('*')
    .order('sort_order');
  return data ?? [];
}

/* ── Créer un article ────────────────────────────────────── */

type CreateBlogInput = {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  cover_image_url?: string;
  cover_image_alt?: string;
  category_id?: string;
  tags?: string[];
  status: 'publish' | 'draft';
  featured?: boolean;
  published_at?: string;
  author?: string;
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
};

export async function createBlogPost(input: CreateBlogInput) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      ...input,
      published_at: input.status === 'publish' && !input.published_at
        ? new Date().toISOString()
        : input.published_at || null,
    } as never)
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
  return data;
}

/* ── Mettre à jour un article ────────────────────────────── */

export async function updateBlogPost(id: string, input: Partial<CreateBlogInput>) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('blog_posts')
    .update({ ...input, updated_at: new Date().toISOString() } as never)
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
}

/* ── Supprimer un article ────────────────────────────────── */

export async function deleteBlogPost(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
}

/* ── Upload image couverture ─────────────────────────────── */

export async function uploadBlogImage(slug: string, formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) throw new Error('Aucun fichier');

  const supabase = createAdminClient();
  const ext = file.name.split('.').pop();
  const path = `blog/${slug}/cover.${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { upsert: true });

  if (error) throw new Error(error.message);

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(path);

  return publicUrl;
}
