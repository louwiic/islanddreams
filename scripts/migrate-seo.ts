#!/usr/bin/env node
/**
 * Migration SEO — Pull Yoast data depuis WooCommerce → Supabase
 *
 * Usage :
 *   npm run migrate:seo
 *   npm run migrate:seo -- --dry-run
 */

import { resolve } from 'node:path';
import { config } from 'dotenv';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const WC_URL = process.env.WOOCOMMERCE_URL!;
const WC_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY!;
const WC_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const DRY_RUN = process.argv.includes('--dry-run');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type WcProduct = {
  id: number;
  slug: string;
  name: string;
  meta_data: { key: string; value: string }[];
  yoast_head_json?: {
    title?: string;
    og_title?: string;
    og_description?: string;
    description?: string;
  };
};

async function fetchAllProducts(): Promise<WcProduct[]> {
  const all: WcProduct[] = [];
  let page = 1;

  while (true) {
    const url = `${WC_URL}/wp-json/wc/v3/products?consumer_key=${WC_KEY}&consumer_secret=${WC_SECRET}&per_page=100&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`WC API ${res.status}`);
    const products = (await res.json()) as WcProduct[];
    if (products.length === 0) break;
    all.push(...products);
    if (products.length < 100) break;
    page++;
  }

  return all;
}

function extractSeo(wc: WcProduct) {
  const yoast = wc.yoast_head_json;
  const meta = wc.meta_data || [];

  // Focus keyword from Yoast meta
  const focusKw = meta.find((m) => m.key === '_yoast_wpseo_focuskw')?.value || null;

  // Meta title: priorité yoast > fallback nom produit
  const metaTitle = yoast?.title || yoast?.og_title || null;

  // Meta description: priorité yoast og_description > meta desc
  const metaDesc = yoast?.og_description || yoast?.description || null;

  return { metaTitle, metaDesc, focusKw };
}

async function migrate() {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log(' 🔍 Migration SEO — Yoast → Supabase');
  console.log('═══════════════════════════════════════════');
  if (DRY_RUN) console.log(' MODE DRY-RUN\n');

  console.log('1️⃣  Récupération des produits WooCommerce...');
  const wcProducts = await fetchAllProducts();
  console.log(`   → ${wcProducts.length} produits\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  console.log('2️⃣  Extraction et mise à jour SEO...\n');

  for (const wc of wcProducts) {
    const seo = extractSeo(wc);
    const slug = wc.slug;

    if (!seo.metaTitle && !seo.metaDesc) {
      skipped++;
      continue;
    }

    console.log(`   📄 ${wc.name}`);
    console.log(`      Title: ${seo.metaTitle || '—'}`);
    console.log(`      Desc:  ${(seo.metaDesc || '—').substring(0, 80)}...`);
    console.log(`      KW:    ${seo.focusKw || '—'}`);

    if (!DRY_RUN) {
      const { error } = await supabase
        .from('products')
        .update({
          meta_title: seo.metaTitle,
          meta_description: seo.metaDesc,
          focus_keyword: seo.focusKw,
        })
        .eq('slug', slug);

      if (error) {
        console.warn(`      ❌ ${error.message}`);
        errors++;
      } else {
        updated++;
      }
    } else {
      updated++;
    }
    console.log('');
  }

  console.log('═══════════════════════════════════════════');
  console.log(' 📊 Rapport SEO');
  console.log('═══════════════════════════════════════════');
  console.log(`   Produits traités   : ${wcProducts.length}`);
  console.log(`   SEO mis à jour     : ${updated}`);
  console.log(`   Sans SEO (ignorés) : ${skipped}`);
  console.log(`   Erreurs            : ${errors}`);
  console.log('═══════════════════════════════════════════\n');
}

migrate().catch((err) => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});
