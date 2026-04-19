#!/usr/bin/env node
/**
 * Import WooCommerce CSV → lib/data/products.ts
 *
 * Usage :
 *   npm run import:products -- --input ./scratch/woocommerce-export.csv
 *
 * Hypothèses sur le CSV :
 *   Format standard WooCommerce (Produits → Export).
 *   Colonnes attendues : ID, Type, SKU, Name, Published, Description,
 *   Short description, Regular price, Sale price, In stock?, Stock,
 *   Categories, Tags, Images, Attributes, Featured, Date created, Date modified
 *
 * Les images restent en URL (WC) dans le fichier généré.
 * Pour les télécharger localement, lancer ensuite `npm run download:images`.
 */

import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { slugify } from '../lib/types/product.js';
import type {
  Product,
  ProductCategory,
  ProductImage,
} from '../lib/types/product.js';

type WooCsvRow = Record<string, string>;

const CATEGORY_MAP: Record<string, ProductCategory> = {
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

function mapCategory(raw: string): ProductCategory {
  if (!raw) return 'uncategorized';
  // WC utilise ">" pour les sous-catégories et "," pour les catégories multiples
  const first = raw.split(/[,>]/)[0].trim().toLowerCase();
  const normalized = first
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return CATEGORY_MAP[normalized] ?? 'uncategorized';
}

function parsePrice(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^\d,.-]/g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseBool(raw: string): boolean {
  const normalized = (raw ?? '').trim().toLowerCase();
  return ['1', 'yes', 'true', 'oui', 'published', 'publish'].includes(
    normalized,
  );
}

function parseImages(raw: string): ProductImage[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((src, position) => ({ src, position }));
}

function parseTags(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseAttributes(row: WooCsvRow): Record<string, string[]> {
  const attrs: Record<string, string[]> = {};
  // WC exporte les attributs avec des colonnes "Attribute X name" / "Attribute X value(s)"
  for (let i = 1; i <= 5; i++) {
    const name = row[`Attribute ${i} name`];
    const values = row[`Attribute ${i} value(s)`];
    if (name && values) {
      attrs[name] = values.split(',').map((v) => v.trim());
    }
  }
  return attrs;
}

function rowToProduct(row: WooCsvRow): Product | null {
  const name = row.Name?.trim();
  if (!name) return null;

  // On ignore les variations WC (on garde uniquement les produits simples et parents)
  const type = row.Type?.toLowerCase();
  if (type === 'variation') return null;

  const regularPrice = parsePrice(row['Regular price'] ?? '');
  const salePrice = parsePrice(row['Sale price'] ?? '');
  const price = salePrice > 0 ? salePrice : regularPrice;

  return {
    id: slugify(name),
    sku: row.SKU?.trim() || undefined,
    name,
    description: row.Description?.trim() || undefined,
    shortDescription: row['Short description']?.trim() || undefined,
    category: mapCategory(row.Categories ?? ''),
    tags: parseTags(row.Tags ?? ''),
    price,
    regularPrice: regularPrice || undefined,
    salePrice: salePrice > 0 ? salePrice : undefined,
    currency: 'EUR',
    inStock: parseBool(row['In stock?'] ?? '1'),
    stockQuantity: row.Stock ? parseInt(row.Stock, 10) : undefined,
    manageStock: !!row.Stock,
    images: parseImages(row.Images ?? ''),
    attributes: parseAttributes(row),
    status: parseBool(row.Published ?? '1') ? 'publish' : 'draft',
    featured: parseBool(row['Is featured?'] ?? '0'),
    createdAt: row['Date created']?.trim() || undefined,
    updatedAt: row['Date modified']?.trim() || undefined,
    woocommerceId: row.ID ? parseInt(row.ID, 10) : undefined,
  };
}

function main() {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf('--input');
  if (inputIdx === -1 || !args[inputIdx + 1]) {
    console.error(
      'Usage : npm run import:products -- --input ./chemin/export.csv',
    );
    process.exit(1);
  }

  const inputPath = resolve(args[inputIdx + 1]);
  const outputPath = resolve('lib/data/products.ts');

  console.log(`→ Lecture CSV : ${inputPath}`);
  const content = readFileSync(inputPath, 'utf-8');

  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as WooCsvRow[];

  console.log(`→ ${rows.length} lignes dans le CSV`);

  const products = rows
    .map(rowToProduct)
    .filter((p): p is Product => p !== null);

  console.log(`→ ${products.length} produits valides`);

  const stats = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
  console.log('→ Répartition par catégorie :');
  Object.entries(stats).forEach(([cat, count]) => {
    console.log(`   - ${cat} : ${count}`);
  });

  const output = `// Catalogue produits Island Dreams — GÉNÉRÉ AUTOMATIQUEMENT
// Ne pas éditer manuellement. Relancer \`npm run import:products\` après modif.
// Source : ${inputPath.replace(process.cwd(), '.')}
// Date de génération : ${new Date().toISOString()}

import type { Product } from '@/lib/types/product';

export const products: Product[] = ${JSON.stringify(products, null, 2)};

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(
  category: Product['category'],
): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured && p.status === 'publish');
}

export function getInStockProducts(): Product[] {
  return products.filter((p) => p.inStock && p.status === 'publish');
}
`;

  writeFileSync(outputPath, output, 'utf-8');
  console.log(`✓ Généré : ${outputPath}`);
}

main();
