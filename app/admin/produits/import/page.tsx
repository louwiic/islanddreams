'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import {
  Upload,
  FileSpreadsheet,
  ArrowLeft,
  Check,
  X,
  AlertTriangle,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductCategory } from '@/lib/types/product';

/* ── Mapping catégories WooCommerce ──────────────────────── */

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
  const first = raw.split(/[,>]/)[0].trim().toLowerCase();
  const normalized = first.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return CATEGORY_MAP[normalized] ?? 'uncategorized';
}

function parsePrice(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^\d,.-]/g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/* ── Types ───────────────────────────────────────────────── */

type ParsedProduct = {
  name: string;
  sku: string;
  category: ProductCategory;
  price: number;
  salePrice: number;
  stock: number | null;
  status: 'publish' | 'draft';
  images: number;
  valid: boolean;
  errors: string[];
};

type ImportStep = 'upload' | 'preview' | 'done';

/* ── Composant principal ─────────────────────────────────── */

export default function ImportPage() {
  const [step, setStep] = useState<ImportStep>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [parseError, setParseError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      setParseError('Seuls les fichiers CSV sont acceptés.');
      return;
    }

    setFileName(file.name);
    setParseError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const rows = results.data as Record<string, string>[];

        if (rows.length === 0) {
          setParseError('Le fichier CSV est vide.');
          return;
        }

        const parsed: ParsedProduct[] = rows
          .filter((row) => {
            const type = (row.Type ?? '').toLowerCase();
            return type !== 'variation';
          })
          .map((row) => {
            const name = row.Name?.trim() ?? '';
            const errors: string[] = [];
            if (!name) errors.push('Nom manquant');

            const regularPrice = parsePrice(row['Regular price'] ?? '');
            const salePrice = parsePrice(row['Sale price'] ?? '');
            const price = salePrice > 0 ? salePrice : regularPrice;
            if (price === 0) errors.push('Pas de prix');

            const images = (row.Images ?? '')
              .split(',')
              .filter((s) => s.trim()).length;

            const stockRaw = row.Stock?.trim();

            return {
              name,
              sku: row.SKU?.trim() ?? '',
              category: mapCategory(row.Categories ?? ''),
              price,
              salePrice: salePrice > 0 ? salePrice : 0,
              stock: stockRaw ? parseInt(stockRaw, 10) : null,
              status: ['1', 'yes', 'true', 'oui', 'published', 'publish'].includes(
                (row.Published ?? '1').trim().toLowerCase()
              )
                ? ('publish' as const)
                : ('draft' as const),
              images,
              valid: errors.length === 0,
              errors,
            };
          });

        setProducts(parsed);
        setStep('preview');
      },
      error(err) {
        setParseError(`Erreur de parsing : ${err.message}`);
      },
    });
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleImport = () => {
    // TODO: envoyer vers Supabase
    setStep('done');
  };

  const validProducts = products.filter((p) => p.valid);
  const invalidProducts = products.filter((p) => !p.valid);

  const categoryStats = validProducts.reduce<Record<string, number>>(
    (acc, p) => {
      acc[p.category] = (acc[p.category] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const categoryLabels: Record<string, string> = {
    magnets: 'Magnets',
    stickers: 'Stickers',
    textile: 'Textile',
    goodies: 'Goodies',
    decoration: 'Décoration',
    uncategorized: 'Non classé',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/produits"
          className="p-2 rounded-lg hover:bg-gray-200/50 transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-500" />
        </Link>
        <div>
          <h2 className="text-lg font-semibold text-ink">Importer des produits</h2>
          <p className="text-sm text-gray-500">
            Format CSV WooCommerce standard
          </p>
        </div>
      </div>

      {/* ── Étape 1 : Upload ───────────────────────────────── */}
      {step === 'upload' && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
            dragOver
              ? 'border-jungle-500 bg-jungle-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={onFileChange}
          />
          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center',
                dragOver ? 'bg-jungle-100' : 'bg-gray-100'
              )}
            >
              <Upload
                size={24}
                className={dragOver ? 'text-jungle-600' : 'text-gray-400'}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">
                Glisser-déposer un fichier CSV
              </p>
              <p className="text-xs text-gray-400 mt-1">
                ou cliquer pour parcourir
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Export WooCommerce standard (Produits &rarr; Export)
            </p>
          </div>
        </div>
      )}

      {parseError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-coral-50 border border-coral-200 rounded-lg">
          <AlertTriangle size={16} className="text-coral-500 shrink-0" />
          <p className="text-sm text-coral-700">{parseError}</p>
        </div>
      )}

      {/* ── Étape 2 : Preview ──────────────────────────────── */}
      {step === 'preview' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400">Fichier</p>
              <p className="text-sm font-medium text-ink mt-1 flex items-center gap-2">
                <FileSpreadsheet size={14} className="text-gray-400" />
                {fileName}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400">Produits valides</p>
              <p className="text-2xl font-bold text-jungle-600 mt-1">
                {validProducts.length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400">Avec erreurs</p>
              <p
                className={cn(
                  'text-2xl font-bold mt-1',
                  invalidProducts.length > 0
                    ? 'text-coral-500'
                    : 'text-gray-300'
                )}
              >
                {invalidProducts.length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400">Catégories</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(categoryStats).map(([cat, count]) => (
                  <span
                    key={cat}
                    className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600"
                  >
                    {categoryLabels[cat] ?? cat} ({count})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Erreurs */}
          {invalidProducts.length > 0 && (
            <div className="bg-coral-50 border border-coral-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-coral-500" />
                <p className="text-sm font-medium text-coral-700">
                  {invalidProducts.length} produit(s) avec erreurs (seront ignorés)
                </p>
              </div>
              <div className="space-y-1">
                {invalidProducts.slice(0, 5).map((p, i) => (
                  <p key={i} className="text-xs text-coral-600">
                    {p.name || '(sans nom)'} — {p.errors.join(', ')}
                  </p>
                ))}
                {invalidProducts.length > 5 && (
                  <p className="text-xs text-coral-400">
                    + {invalidProducts.length - 5} autres...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Table preview */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-medium text-ink">
                Aperçu ({validProducts.length} produits)
              </p>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="px-5 py-2 font-medium">#</th>
                    <th className="px-5 py-2 font-medium">Produit</th>
                    <th className="px-5 py-2 font-medium">SKU</th>
                    <th className="px-5 py-2 font-medium">Catégorie</th>
                    <th className="px-5 py-2 font-medium">Prix</th>
                    <th className="px-5 py-2 font-medium">Stock</th>
                    <th className="px-5 py-2 font-medium">Images</th>
                    <th className="px-5 py-2 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {validProducts.map((product, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-5 py-2 text-xs text-gray-400">
                        {i + 1}
                      </td>
                      <td className="px-5 py-2">
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-gray-300" />
                          <span className="text-sm text-ink">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-2 text-xs text-gray-500 font-mono">
                        {product.sku || '—'}
                      </td>
                      <td className="px-5 py-2">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                          {categoryLabels[product.category] ?? product.category}
                        </span>
                      </td>
                      <td className="px-5 py-2 text-sm text-ink">
                        {product.price.toFixed(2)} €
                        {product.salePrice > 0 && (
                          <span className="ml-1 text-[10px] text-coral-500 font-medium">
                            PROMO
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-2 text-sm text-gray-600">
                        {product.stock !== null ? product.stock : '—'}
                      </td>
                      <td className="px-5 py-2 text-sm text-gray-500">
                        {product.images}
                      </td>
                      <td className="px-5 py-2">
                        <span
                          className={cn(
                            'inline-block px-2 py-0.5 rounded-full text-[10px] font-medium',
                            product.status === 'publish'
                              ? 'bg-jungle-50 text-jungle-600'
                              : 'bg-gray-100 text-gray-500'
                          )}
                        >
                          {product.status === 'publish' ? 'Publié' : 'Brouillon'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setStep('upload');
                setProducts([]);
                setFileName('');
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-ink transition-colors"
            >
              Changer de fichier
            </button>
            <button
              onClick={handleImport}
              disabled={validProducts.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-jungle-600 text-white rounded-lg text-sm font-medium hover:bg-jungle-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check size={16} />
              Importer {validProducts.length} produit(s)
            </button>
          </div>
        </>
      )}

      {/* ── Étape 3 : Confirmation ─────────────────────────── */}
      {step === 'done' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-jungle-100 flex items-center justify-center mx-auto mb-4">
            <Check size={24} className="text-jungle-600" />
          </div>
          <h3 className="text-lg font-semibold text-ink">Import terminé</h3>
          <p className="text-sm text-gray-500 mt-2">
            {validProducts.length} produit(s) importé(s) avec succès.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Les produits seront disponibles une fois Supabase connecté.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => {
                setStep('upload');
                setProducts([]);
                setFileName('');
              }}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Importer un autre fichier
            </button>
            <Link
              href="/admin/produits"
              className="px-4 py-2 text-sm font-medium text-white bg-jungle-600 rounded-lg hover:bg-jungle-700 transition-colors"
            >
              Voir les produits
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
