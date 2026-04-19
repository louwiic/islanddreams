#!/usr/bin/env node
/**
 * Télécharge les images produit depuis leurs URLs (WooCommerce)
 * vers public/images/products/[category]/ et met à jour lib/data/products.ts
 * avec les chemins locaux.
 *
 * Usage :
 *   npm run download:images
 *
 * Prérequis : lib/data/products.ts déjà peuplé via `npm run import:products`.
 */

import { createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { slugify } from '../lib/types/product.js';
import type { Product } from '../lib/types/product.js';

const OUTPUT_BASE = 'public/images/products';
const PRODUCTS_FILE = 'lib/data/products.ts';

function getExtension(url: string): string {
  const clean = url.split('?')[0];
  const ext = extname(clean).toLowerCase();
  return ext || '.jpg';
}

function getLocalPath(
  product: Product,
  position: number,
  url: string,
): string {
  const ext = getExtension(url);
  const suffix = position === 0 ? '' : `-${position}`;
  return `${product.category}/${product.id}${suffix}${ext}`;
}

async function downloadOne(url: string, dest: string): Promise<boolean> {
  const fullPath = resolve(OUTPUT_BASE, dest);
  if (existsSync(fullPath)) {
    console.log(`   ⊙ déjà présent : ${dest}`);
    return true;
  }

  try {
    const res = await fetch(url);
    if (!res.ok || !res.body) {
      console.error(`   ✗ ${res.status} : ${url}`);
      return false;
    }
    const dir = resolve(fullPath, '..');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    await pipeline(
      // @ts-expect-error - fetch body is ReadableStream, Readable.fromWeb accepts it
      Readable.fromWeb(res.body),
      createWriteStream(fullPath),
    );
    console.log(`   ✓ ${dest}`);
    return true;
  } catch (err) {
    console.error(`   ✗ Erreur : ${url}`, err);
    return false;
  }
}

async function main() {
  console.log(`→ Lecture ${PRODUCTS_FILE}`);
  const source = await readFile(PRODUCTS_FILE, 'utf-8');

  // On extrait l'array JSON depuis le fichier TS généré
  const match = source.match(/export const products: Product\[\] = (\[[\s\S]*?\n\]);/);
  if (!match) {
    console.error('✗ Impossible de parser lib/data/products.ts');
    console.error('  As-tu bien lancé `npm run import:products` avant ?');
    process.exit(1);
  }

  const products: Product[] = JSON.parse(match[1]);
  console.log(`→ ${products.length} produits à traiter\n`);

  let downloaded = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of products) {
    if (product.images.length === 0) continue;
    console.log(`[${product.category}] ${product.name}`);

    for (const img of product.images) {
      if (img.localPath) {
        skipped++;
        continue;
      }
      if (!img.src.startsWith('http')) {
        skipped++;
        continue;
      }

      const localPath = getLocalPath(product, img.position, img.src);
      const ok = await downloadOne(img.src, localPath);
      if (ok) {
        img.localPath = `products/${localPath}`;
        downloaded++;
      } else {
        errors++;
      }
    }
  }

  // Réécrit products.ts avec les localPath mis à jour
  const updated = source.replace(
    /export const products: Product\[\] = \[[\s\S]*?\n\];/,
    `export const products: Product[] = ${JSON.stringify(products, null, 2)};`,
  );
  await writeFile(PRODUCTS_FILE, updated, 'utf-8');

  console.log('\n=== Bilan ===');
  console.log(`✓ Téléchargées : ${downloaded}`);
  console.log(`⊙ Ignorées (déjà là) : ${skipped}`);
  console.log(`✗ Erreurs : ${errors}`);
  console.log(`\nlib/data/products.ts mis à jour avec les chemins locaux.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
