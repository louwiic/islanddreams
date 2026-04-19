'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

/* ── Lire toutes les catégories (admin) ──────────────────── */

export async function getCategories() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');

  if (error) throw new Error(error.message);
  return data;
}

/* ── Lire la catégorie featured navbar (public) ──────────── */

export async function getNavFeaturedCategory() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_nav_featured', true)
    .single();

  return data;
}

/* ── Créer une catégorie ─────────────────────────────────── */

export async function createCategory(formData: {
  name: string;
  slug: string;
  description?: string;
  navLabel?: string;
  navColor?: string;
  isNavFeatured?: boolean;
}) {
  const supabase = createAdminClient();

  // Trouver le prochain sort_order
  const { data: last } = await supabase
    .from('categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      nav_label: formData.navLabel || null,
      nav_color: formData.navColor || null,
      is_nav_featured: formData.isNavFeatured ?? false,
      sort_order: (last?.sort_order ?? 0) + 1,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/admin/categories');
  revalidatePath('/');
  return { category: data };
}

/* ── Mettre à jour une catégorie ─────────────────────────── */

export async function updateCategory(
  id: string,
  formData: {
    name: string;
    slug: string;
    description?: string;
    navLabel?: string;
    navColor?: string;
    isNavFeatured?: boolean;
  }
) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('categories')
    .update({
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      nav_label: formData.navLabel || null,
      nav_color: formData.navColor || null,
      is_nav_featured: formData.isNavFeatured ?? false,
    })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/categories');
  revalidatePath('/');
  return { success: true };
}

/* ── Supprimer une catégorie ─────────────────────────────── */

export async function deleteCategory(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/categories');
  revalidatePath('/');
  return { success: true };
}
