'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import sharp from 'sharp';

const MAX_WIDTH = 1200;
const QUALITY = 80;

async function compressImage(buffer: Buffer): Promise<{ data: Buffer; contentType: string; ext: string }> {
  const compressed = await sharp(buffer)
    .resize(MAX_WIDTH, undefined, { withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();

  return { data: compressed, contentType: 'image/webp', ext: 'webp' };
}

export async function uploadProductImage(
  productSlug: string,
  formData: FormData
): Promise<{ url: string; error?: string }> {
  const file = formData.get('file') as File | null;
  if (!file) return { url: '', error: 'Aucun fichier' };

  const supabase = createAdminClient();

  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const { data: compressed, contentType, ext } = await compressImage(rawBuffer);

  const path = `${productSlug}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, compressed, {
      contentType,
      upsert: true,
    });

  if (error) return { url: '', error: error.message };

  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function uploadTextileImage(
  formData: FormData
): Promise<{ url: string; error?: string }> {
  const file = formData.get('file') as File | null;
  if (!file) return { url: '', error: 'Aucun fichier' };

  const supabase = createAdminClient();

  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const { data: compressed, contentType, ext } = await compressImage(rawBuffer);

  const path = `textile/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, compressed, {
      contentType,
      upsert: true,
    });

  if (error) return { url: '', error: error.message };

  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function saveProductImages(
  productId: string,
  images: { url: string; alt: string; isMain: boolean; position: number }[]
) {
  const supabase = createAdminClient();

  // Supprimer les anciennes images
  await supabase.from('product_images').delete().eq('product_id', productId);

  if (images.length === 0) return { success: true };

  const rows = images.map((img) => ({
    product_id: productId,
    url: img.url,
    alt: img.alt,
    is_main: img.isMain,
    position: img.position,
  }));

  const { error } = await supabase.from('product_images').insert(rows);
  if (error) return { error: error.message };

  return { success: true };
}
