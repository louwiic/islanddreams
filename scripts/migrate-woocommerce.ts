#!/usr/bin/env node
/**
 * Migration WooCommerce → Supabase
 *
 * Usage :
 *   npm run migrate:woo
 *   npm run migrate:woo -- --dry-run     (aperçu sans écrire)
 *   npm run migrate:woo -- --skip-images (produits sans télécharger les images)
 *
 * Requis dans .env.local :
 *   WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { resolve } from 'node:path';
import { config } from 'dotenv';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'node:fs';

/* ── Config ──────────────────────────────────────────────── */

const WC_URL = process.env.WOOCOMMERCE_URL!;
const WC_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY!;
const WC_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_IMAGES = args.includes('--skip-images');

if (!WC_URL || !WC_KEY || !WC_SECRET) {
  console.error('❌ Variables WooCommerce manquantes dans .env.local');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variables Supabase manquantes dans .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/* ── Types WooCommerce ───────────────────────────────────── */

type WcImage = {
  id: number;
  src: string;
  name: string;
  alt: string;
};

type WcAttribute = {
  id: number;
  name: string;
  options: string[];
  variation: boolean;
};

type WcProduct = {
  id: number;
  name: string;
  slug: string;
  type: string; // simple, variable, grouped, external
  status: string; // publish, draft, private
  featured: boolean;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: string;
  weight: string;
  categories: { id: number; name: string; slug: string }[];
  tags: { id: number; name: string; slug: string }[];
  images: WcImage[];
  attributes: WcAttribute[];
  variations: number[];
  date_created: string;
  date_modified: string;
};

type WcVariation = {
  id: number;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: string;
  attributes: { id: number; name: string; option: string }[];
  image: WcImage;
};

/* ── Mapping catégories ──────────────────────────────────── */

const CATEGORY_MAP: Record<string, string> = {
  magnet: 'magnets',
  magnets: 'magnets',
  sticker: 'stickers',
  stickers: 'stickers',
  autocollant: 'stickers',
  autocollants: 'stickers',
  textile: 'textile',
  textiles: 'textile',
  tshirt: 'textile',
  't-shirt': 'textile',
  vetement: 'textile',
  goodies: 'goodies',
  goodie: 'goodies',
  deco: 'decoration',
  decoration: 'decoration',
  decorations: 'decoration',
};

function mapCategory(categories: WcProduct['categories']): string {
  if (!categories.length) return 'uncategorized';
  for (const cat of categories) {
    const key = cat.slug
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];
    // Essayer aussi le name
    const nameKey = cat.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (CATEGORY_MAP[nameKey]) return CATEGORY_MAP[nameKey];
  }
  return 'uncategorized';
}

/* ── WooCommerce API ─────────────────────────────────────── */

async function wcFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${WC_URL}/wp-json/wc/v3/${endpoint}`);
  url.searchParams.set('consumer_key', WC_KEY);
  url.searchParams.set('consumer_secret', WC_SECRET);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`WC API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

async function fetchAllProducts(): Promise<WcProduct[]> {
  const allProducts: WcProduct[] = [];
  let page = 1;
  const perPage = '100';

  while (true) {
    console.log(`   📦 Récupération page ${page}...`);
    const products = await wcFetch<WcProduct[]>('products', {
      per_page: perPage,
      page: page.toString(),
      orderby: 'id',
      order: 'asc',
    });

    if (products.length === 0) break;
    allProducts.push(...products);

    if (products.length < parseInt(perPage)) break;
    page++;
  }

  return allProducts;
}

async function fetchVariations(productId: number): Promise<WcVariation[]> {
  const allVariations: WcVariation[] = [];
  let page = 1;

  while (true) {
    const variations = await wcFetch<WcVariation[]>(
      `products/${productId}/variations`,
      { per_page: '100', page: page.toString() }
    );

    if (variations.length === 0) break;
    allVariations.push(...variations);

    if (variations.length < 100) break;
    page++;
  }

  return allVariations;
}

/* ── Image helpers ───────────────────────────────────────── */

async function downloadImage(url: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) {
      console.warn(`   ⚠️  Image ${res.status}: ${url}`);
      return null;
    }
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await res.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), contentType };
  } catch (e) {
    console.warn(`   ⚠️  Erreur download: ${url}`);
    return null;
  }
}

function imageExtFromUrl(url: string, contentType: string): string {
  // Essayer depuis le content-type
  if (contentType.includes('webp')) return 'webp';
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('gif')) return 'gif';
  // Fallback depuis l'URL
  const match = url.match(/\.(jpe?g|png|webp|gif)/i);
  return match ? match[1].toLowerCase() : 'jpg';
}

async function uploadImage(
  productSlug: string,
  imageUrl: string,
  position: number,
  contentType: string,
  buffer: Buffer
): Promise<string | null> {
  const ext = imageExtFromUrl(imageUrl, contentType);
  const path = `${productSlug}/${position}.${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.warn(`   ⚠️  Upload échoué ${path}: ${error.message}`);
    return null;
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

/* ── Migration principale ────────────────────────────────── */

type MigrationReport = {
  totalWcProducts: number;
  productsCreated: number;
  productsUpdated: number;
  productsSkipped: number;
  imagesUploaded: number;
  imagesFailed: number;
  variantsCreated: number;
  errors: string[];
};

async function migrate() {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log(' 🏝️  Migration WooCommerce → Supabase');
  console.log('═══════════════════════════════════════════');
  if (DRY_RUN) console.log(' 🔍 MODE DRY-RUN — aucune écriture');
  if (SKIP_IMAGES) console.log(' 📷 Images ignorées (--skip-images)');
  console.log('');

  const report: MigrationReport = {
    totalWcProducts: 0,
    productsCreated: 0,
    productsUpdated: 0,
    productsSkipped: 0,
    imagesUploaded: 0,
    imagesFailed: 0,
    variantsCreated: 0,
    errors: [],
  };

  // 1. Récupérer tous les produits WooCommerce
  console.log('1️⃣  Récupération des produits WooCommerce...');
  const wcProducts = await fetchAllProducts();
  report.totalWcProducts = wcProducts.length;
  console.log(`   → ${wcProducts.length} produits trouvés\n`);

  if (DRY_RUN) {
    console.log('── Aperçu des produits ──');
    for (const p of wcProducts) {
      const cat = mapCategory(p.categories);
      console.log(
        `   ${p.id} | ${p.name} | ${cat} | ${p.price}€ | ${p.images.length} img | ${p.type} | ${p.status}`
      );
    }
    console.log('');
    printReport(report);
    return;
  }

  // 2. Migrer chaque produit
  console.log('2️⃣  Migration des produits...\n');

  for (const wc of wcProducts) {
    // Ignorer les variations WooCommerce (on les récupère via le parent)
    if (wc.type === 'variation') {
      report.productsSkipped++;
      continue;
    }

    const slug = wc.slug || wc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    console.log(`   📦 ${wc.name} (${slug})`);

    const price = parseFloat(wc.price) || parseFloat(wc.regular_price) || 0;
    const regularPrice = parseFloat(wc.regular_price) || price;
    const salePrice = wc.sale_price ? parseFloat(wc.sale_price) : null;

    // Upsert produit
    const productData = {
      slug,
      name: wc.name,
      description: wc.description || null,
      short_description: wc.short_description || null,
      category: mapCategory(wc.categories) as any,
      tags: wc.tags.map((t) => t.name),
      price,
      regular_price: regularPrice,
      sale_price: salePrice,
      currency: 'EUR',
      sku: wc.sku || null,
      in_stock: wc.stock_status === 'instock',
      stock_quantity: wc.stock_quantity,
      manage_stock: wc.manage_stock,
      weight_grams: wc.weight ? Math.round(parseFloat(wc.weight) * 1000) : null,
      status: (wc.status === 'publish' ? 'publish' : wc.status === 'private' ? 'private' : 'draft') as any,
      featured: wc.featured,
    };

    // Check si le produit existe déjà (par slug)
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single();

    let productId: string;

    if (existing) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', existing.id);

      if (error) {
        console.warn(`   ❌ Update échoué: ${error.message}`);
        report.errors.push(`${wc.name}: ${error.message}`);
        continue;
      }
      productId = existing.id;
      report.productsUpdated++;
      console.log(`      ↻ Mis à jour`);
    } else {
      const { data: inserted, error } = await supabase
        .from('products')
        .insert(productData)
        .select('id')
        .single();

      if (error) {
        console.warn(`   ❌ Insert échoué: ${error.message}`);
        report.errors.push(`${wc.name}: ${error.message}`);
        continue;
      }
      productId = inserted.id;
      report.productsCreated++;
      console.log(`      ✓ Créé`);
    }

    // 3. Images
    if (!SKIP_IMAGES && wc.images.length > 0) {
      // Supprimer anciennes images de ce produit
      await supabase.from('product_images').delete().eq('product_id', productId);

      for (let i = 0; i < wc.images.length; i++) {
        const img = wc.images[i];
        console.log(`      🖼️  Image ${i + 1}/${wc.images.length}: ${img.name || img.src.split('/').pop()}`);

        const downloaded = await downloadImage(img.src);
        if (!downloaded) {
          report.imagesFailed++;
          continue;
        }

        const publicUrl = await uploadImage(
          slug,
          img.src,
          i,
          downloaded.contentType,
          downloaded.buffer
        );

        if (!publicUrl) {
          report.imagesFailed++;
          continue;
        }

        await supabase.from('product_images').insert({
          product_id: productId,
          url: publicUrl,
          alt: img.alt || img.name || wc.name,
          position: i,
          is_main: i === 0,
        });

        report.imagesUploaded++;
      }
    }

    // 4. Attributs
    if (wc.attributes.length > 0) {
      await supabase.from('product_attributes').delete().eq('product_id', productId);

      const attrs = wc.attributes
        .filter((a) => a.options.length > 0)
        .map((a) => ({
          product_id: productId,
          name: a.name,
          values: a.options,
        }));

      if (attrs.length > 0) {
        await supabase.from('product_attributes').insert(attrs);
      }
    }

    // 5. Variantes (produits variables)
    if (wc.type === 'variable' && wc.variations.length > 0) {
      console.log(`      🔀 ${wc.variations.length} variante(s)...`);
      await supabase.from('product_variants').delete().eq('product_id', productId);

      try {
        const variations = await fetchVariations(wc.id);

        for (const v of variations) {
          const combination: Record<string, string> = {};
          for (const attr of v.attributes) {
            combination[attr.name] = attr.option;
          }

          await supabase.from('product_variants').insert({
            product_id: productId,
            combination,
            price: v.price ? parseFloat(v.price) : null,
            sku: v.sku || null,
            stock_quantity: v.stock_quantity,
            enabled: v.stock_status !== 'outofstock',
          });

          report.variantsCreated++;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn(`      ⚠️  Variantes échouées: ${msg}`);
        report.errors.push(`${wc.name} variantes: ${msg}`);
      }
    }

    console.log('');
  }

  // Rapport
  printReport(report);

  // Sauvegarder le rapport
  const reportPath = resolve('scripts/migration-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Rapport sauvegardé: ${reportPath}\n`);
}

function printReport(report: MigrationReport) {
  console.log('═══════════════════════════════════════════');
  console.log(' 📊 Rapport de migration');
  console.log('═══════════════════════════════════════════');
  console.log(`   Produits WooCommerce  : ${report.totalWcProducts}`);
  console.log(`   Produits créés        : ${report.productsCreated}`);
  console.log(`   Produits mis à jour   : ${report.productsUpdated}`);
  console.log(`   Produits ignorés      : ${report.productsSkipped}`);
  console.log(`   Images uploadées      : ${report.imagesUploaded}`);
  console.log(`   Images échouées       : ${report.imagesFailed}`);
  console.log(`   Variantes créées      : ${report.variantsCreated}`);
  if (report.errors.length > 0) {
    console.log(`   ❌ Erreurs (${report.errors.length}) :`);
    for (const err of report.errors) {
      console.log(`      - ${err}`);
    }
  }
  console.log('═══════════════════════════════════════════\n');
}

migrate().catch((err) => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});
