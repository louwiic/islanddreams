'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/types';

export type ProductRow = Tables<'products'>;

/* ── Lire tous les produits (admin — inclut brouillons) ──── */

export async function getProducts() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

/* ── Lire un produit par slug ────────────────────────────── */

export async function getProductBySlug(slug: string) {
  const supabase = createAdminClient();

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;

  // Charger images, attributs, variantes en parallèle
  const [images, attributes, variants] = await Promise.all([
    supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('position'),
    supabase
      .from('product_attributes')
      .select('*')
      .eq('product_id', product.id),
    supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id),
  ]);

  return {
    ...product,
    images: images.data ?? [],
    attributes: attributes.data ?? [],
    variants: variants.data ?? [],
  };
}

/* ── Lire un produit par ID ──────────────────────────────── */

export async function getProductById(id: string) {
  const supabase = createAdminClient();

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;

  const [images, attributes, variants] = await Promise.all([
    supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('position'),
    supabase
      .from('product_attributes')
      .select('*')
      .eq('product_id', product.id),
    supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id),
  ]);

  return {
    ...product,
    images: images.data ?? [],
    attributes: attributes.data ?? [],
    variants: variants.data ?? [],
  };
}

/* ── Créer un produit ────────────────────────────────────── */

export async function createProduct(formData: {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  category: string;
  tags: string[];
  price: number;
  salePrice?: number;
  sku?: string;
  manageStock: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  weightGrams?: number;
  status: string;
  featured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  attributes?: { name: string; values: string[] }[];
  variants?: { combination: Record<string, string>; price?: number; sku?: string; stock?: number; enabled: boolean }[];
}) {
  const supabase = createAdminClient();

  const insert: TablesInsert<'products'> = {
    name: formData.name,
    slug: formData.slug,
    description: formData.description || null,
    short_description: formData.shortDescription || null,
    category: formData.category as TablesInsert<'products'>['category'],
    tags: formData.tags,
    price: formData.price,
    regular_price: formData.price,
    sale_price: formData.salePrice || null,
    sku: formData.sku || null,
    manage_stock: formData.manageStock,
    stock_quantity: formData.stockQuantity ?? null,
    low_stock_threshold: formData.lowStockThreshold ?? 5,
    weight_grams: formData.weightGrams ?? null,
    in_stock: formData.manageStock ? (formData.stockQuantity ?? 0) > 0 : true,
    status: formData.status as TablesInsert<'products'>['status'],
    featured: formData.featured,
    meta_title: formData.metaTitle || null,
    meta_description: formData.metaDescription || null,
    focus_keyword: formData.focusKeyword || null,
  };

  const { data: product, error } = await supabase
    .from('products')
    .insert(insert)
    .select()
    .single();

  if (error) return { error: error.message };

  // Attributs
  if (formData.attributes && formData.attributes.length > 0) {
    const attrs = formData.attributes
      .filter((a) => a.name.trim() && a.values.length > 0)
      .map((a) => ({
        product_id: product.id,
        name: a.name,
        values: a.values,
      }));

    if (attrs.length > 0) {
      await supabase.from('product_attributes').insert(attrs);
    }
  }

  // Variantes
  if (formData.variants && formData.variants.length > 0) {
    const vars = formData.variants
      .filter((v) => v.enabled)
      .map((v) => ({
        product_id: product.id,
        combination: v.combination,
        price: v.price ?? null,
        sku: v.sku || null,
        stock_quantity: v.stock ?? null,
        enabled: v.enabled,
      }));

    if (vars.length > 0) {
      await supabase.from('product_variants').insert(vars);
    }
  }

  revalidatePath('/admin/produits');
  return { product };
}

/* ── Mettre à jour un produit ────────────────────────────── */

export async function updateProduct(
  id: string,
  formData: {
    name: string;
    slug: string;
    description?: string;
    shortDescription?: string;
    category: string;
    tags: string[];
    price: number;
    salePrice?: number;
    sku?: string;
    manageStock: boolean;
    stockQuantity?: number;
    lowStockThreshold?: number;
    weightGrams?: number;
    status: string;
    featured: boolean;
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    attributes?: { name: string; values: string[] }[];
    variants?: { combination: Record<string, string>; price?: number; sku?: string; stock?: number; enabled: boolean }[];
  }
) {
  const supabase = createAdminClient();

  const update: TablesUpdate<'products'> = {
    name: formData.name,
    slug: formData.slug,
    description: formData.description || null,
    short_description: formData.shortDescription || null,
    category: formData.category as TablesUpdate<'products'>['category'],
    tags: formData.tags,
    price: formData.price,
    regular_price: formData.price,
    sale_price: formData.salePrice || null,
    sku: formData.sku || null,
    manage_stock: formData.manageStock,
    stock_quantity: formData.stockQuantity ?? null,
    low_stock_threshold: formData.lowStockThreshold ?? 5,
    weight_grams: formData.weightGrams ?? null,
    in_stock: formData.manageStock ? (formData.stockQuantity ?? 0) > 0 : true,
    status: formData.status as TablesUpdate<'products'>['status'],
    featured: formData.featured,
    meta_title: formData.metaTitle || null,
    meta_description: formData.metaDescription || null,
    focus_keyword: formData.focusKeyword || null,
  };

  const { error } = await supabase
    .from('products')
    .update(update)
    .eq('id', id);

  if (error) return { error: error.message };

  // Remplacer attributs
  await supabase.from('product_attributes').delete().eq('product_id', id);
  if (formData.attributes && formData.attributes.length > 0) {
    const attrs = formData.attributes
      .filter((a) => a.name.trim() && a.values.length > 0)
      .map((a) => ({
        product_id: id,
        name: a.name,
        values: a.values,
      }));
    if (attrs.length > 0) {
      await supabase.from('product_attributes').insert(attrs);
    }
  }

  // Remplacer variantes
  await supabase.from('product_variants').delete().eq('product_id', id);
  if (formData.variants && formData.variants.length > 0) {
    const vars = formData.variants
      .filter((v) => v.enabled)
      .map((v) => ({
        product_id: id,
        combination: v.combination,
        price: v.price ?? null,
        sku: v.sku || null,
        stock_quantity: v.stock ?? null,
        enabled: v.enabled,
      }));
    if (vars.length > 0) {
      await supabase.from('product_variants').insert(vars);
    }
  }

  revalidatePath('/admin/produits');
  revalidatePath(`/admin/produits/${formData.slug}`);
  return { success: true };
}

/* ── Supprimer un produit ────────────────────────────────── */

export async function deleteProduct(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/produits');
  return { success: true };
}
