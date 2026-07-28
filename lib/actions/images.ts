'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import sharp from 'sharp';

const MAX_WIDTH = 1200;
const QUALITY = 80;
const MAX_VIDEO_SIZE = 60 * 1024 * 1024;
const PRODUCT_IMAGES_BUCKET = 'product-images';

export type MediaLibraryImage = {
  url: string;
  alt: string;
  label: string;
  source: 'product' | 'storage';
};

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
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, compressed, {
      contentType,
      upsert: true,
    });

  if (error) return { url: '', error: error.message };

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
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
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, compressed, {
      contentType,
      upsert: true,
    });

  if (error) return { url: '', error: error.message };

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function uploadDemoVideo(
  formData: FormData
): Promise<{ url: string; error?: string }> {
  const file = formData.get('file') as File | null;
  if (!file) return { url: '', error: 'Aucun fichier' };
  if (!file.type.startsWith('video/')) return { url: '', error: 'Le fichier doit être une vidéo' };
  if (file.size > MAX_VIDEO_SIZE) return { url: '', error: 'La vidéo ne doit pas dépasser 60 Mo' };

  const supabase = createAdminClient();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
  const path = `demo-videos/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: true,
    });

  if (error) return { url: '', error: error.message };

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
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

type ProductImageWithProduct = {
  url: string;
  alt: string | null;
  product:
    | {
        name: string | null;
        slug: string | null;
      }
    | {
        name: string | null;
        slug: string | null;
      }[]
    | null;
};

type StorageObject = {
  name: string;
  id: string | null;
  metadata: Record<string, unknown> | null;
};

function getProductLabel(product: ProductImageWithProduct['product']) {
  if (Array.isArray(product)) {
    return product[0]?.name || product[0]?.slug || 'Produit';
  }

  return product?.name || product?.slug || 'Produit';
}

function isImageFile(path: string) {
  return /\.(avif|gif|jpe?g|png|webp)$/i.test(path);
}

async function listStorageImages(
  path = '',
  limit = 250
): Promise<MediaLibraryImage[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .list(path, {
      limit,
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error || !data) return [];

  const images: MediaLibraryImage[] = [];

  for (const item of data as StorageObject[]) {
    const itemPath = path ? `${path}/${item.name}` : item.name;

    if (!item.id && !isImageFile(itemPath)) {
      images.push(...(await listStorageImages(itemPath, limit)));
      continue;
    }

    if (!isImageFile(itemPath)) continue;

    const { data: publicUrl } = supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(itemPath);

    images.push({
      url: publicUrl.publicUrl,
      alt: item.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
      label: itemPath,
      source: 'storage',
    });
  }

  return images;
}

export async function getMediaLibraryImages(): Promise<{
  images: MediaLibraryImage[];
  error?: string;
}> {
  const supabase = createAdminClient();

  const { data: productImages, error } = await supabase
    .from('product_images')
    .select('url, alt, product:product_id(name, slug)')
    .order('created_at', { ascending: false })
    .limit(400);

  if (error) return { images: [], error: error.message };

  const byUrl = new Map<string, MediaLibraryImage>();

  for (const image of (productImages ?? []) as ProductImageWithProduct[]) {
    byUrl.set(image.url, {
      url: image.url,
      alt: image.alt || getProductLabel(image.product),
      label: getProductLabel(image.product),
      source: 'product',
    });
  }

  for (const image of await listStorageImages()) {
    if (!byUrl.has(image.url)) byUrl.set(image.url, image);
  }

  return { images: Array.from(byUrl.values()) };
}
