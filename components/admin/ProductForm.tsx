'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Trash2, Copy, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { slugify, type ProductCategory, type ProductStatus } from '@/lib/types/product';
import { createProduct, updateProduct, deleteProduct } from '@/lib/actions/products';
import { uploadProductImage, saveProductImages } from '@/lib/actions/images';
import { ImageUploadZone, type ImageItem } from './ImageUploadZone';
import { VariantManager, type Attribute, type Variant } from './VariantManager';

/* ── Types ───────────────────────────────────────────────── */

type ProductFormData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: ProductCategory;
  tags: string[];
  price: string;
  salePrice: string;
  sku: string;
  manageStock: boolean;
  stockQuantity: string;
  lowStockThreshold: string;
  weight: string;
  status: ProductStatus;
  featured: boolean;
  images: ImageItem[];
  attributes: Attribute[];
  variants: Variant[];
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
};

type Props = {
  mode: 'create' | 'edit';
  initialData?: Partial<ProductFormData>;
};

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'magnets', label: 'Magnets' },
  { value: 'stickers', label: 'Stickers' },
  { value: 'textile', label: 'Textile' },
  { value: 'goodies', label: 'Goodies' },
  { value: 'decoration', label: 'Décoration' },
  { value: 'uncategorized', label: 'Non classé' },
];

const STATUS_OPTIONS: { value: ProductStatus; label: string; color: string }[] = [
  { value: 'publish', label: 'Publié', color: 'bg-jungle-500' },
  { value: 'draft', label: 'Brouillon', color: 'bg-gray-400' },
  { value: 'private', label: 'Privé', color: 'bg-ocean-500' },
];

const DEFAULT: ProductFormData = {
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  category: 'uncategorized',
  tags: [],
  price: '',
  salePrice: '',
  sku: '',
  manageStock: false,
  stockQuantity: '',
  lowStockThreshold: '5',
  weight: '',
  status: 'draft',
  featured: false,
  images: [],
  attributes: [],
  variants: [],
  metaTitle: '',
  metaDescription: '',
  focusKeyword: '',
};

/* ── Section collapsible ─────────────────────────────────── */

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
      >
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <ChevronDown
          size={16}
          className={cn(
            'text-gray-400 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && <div className="px-6 pb-6 space-y-4">{children}</div>}
    </div>
  );
}

/* ── Composant principal ─────────────────────────────────── */

export function ProductForm({ mode, initialData }: Props) {
  const [form, setForm] = useState<ProductFormData>({
    ...DEFAULT,
    ...initialData,
  });
  const router = useRouter();
  const [tagInput, setTagInput] = useState('');
  const [autoSlug, setAutoSlug] = useState(!initialData?.slug);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = <K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K]
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-slug
      if (key === 'name' && autoSlug) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !form.tags.includes(trimmed)) {
      update('tags', [...form.tags, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    update(
      'tags',
      form.tags.filter((t) => t !== tag)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    const priceNum = parseFloat(form.price.replace(',', '.')) || 0;
    const salePriceNum = form.salePrice
      ? parseFloat(form.salePrice.replace(',', '.')) || undefined
      : undefined;

    const payload = {
      name: form.name.trim(),
      slug: form.slug || slugify(form.name),
      description: form.description || undefined,
      shortDescription: form.shortDescription || undefined,
      category: form.category,
      tags: form.tags,
      price: priceNum,
      salePrice: salePriceNum,
      sku: form.sku || undefined,
      manageStock: form.manageStock,
      stockQuantity: form.stockQuantity ? parseInt(form.stockQuantity) : undefined,
      lowStockThreshold: form.lowStockThreshold ? parseInt(form.lowStockThreshold) : undefined,
      weightGrams: form.weight ? parseInt(form.weight) : undefined,
      status: form.status,
      featured: form.featured,
      attributes: form.attributes
        .filter((a) => a.name.trim() && a.values.length > 0)
        .map((a) => ({ name: a.name, values: a.values })),
      variants: form.variants.map((v) => ({
        combination: v.combination,
        price: v.price ? parseFloat(v.price.replace(',', '.')) : undefined,
        sku: v.sku || undefined,
        stock: v.stock ? parseInt(v.stock) : undefined,
        enabled: v.enabled,
      })),
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
      focusKeyword: form.focusKeyword || undefined,
    };

    try {
      let productId = form.id;

      if (mode === 'edit' && form.id) {
        const result = await updateProduct(form.id, payload);
        if (result.error) {
          setError(result.error);
          setSaving(false);
          return;
        }
      } else {
        const result = await createProduct(payload);
        if (result.error) {
          setError(result.error);
          setSaving(false);
          return;
        }
        productId = result.product?.id;
      }

      // Upload images si des fichiers locaux existent
      if (productId && form.images.length > 0) {
        const uploadedImages: { url: string; alt: string; isMain: boolean; position: number }[] = [];

        for (let i = 0; i < form.images.length; i++) {
          const img = form.images[i];
          if (img.file) {
            // Nouveau fichier — upload vers Supabase Storage
            const fd = new FormData();
            fd.append('file', img.file);
            const { url, error: uploadError } = await uploadProductImage(
              payload.slug,
              fd
            );
            if (url) {
              uploadedImages.push({ url, alt: img.alt, isMain: img.isMain, position: i });
            } else if (uploadError) {
              console.warn('Upload failed:', uploadError);
            }
          } else {
            // Image existante (URL déjà dans Supabase)
            uploadedImages.push({ url: img.preview, alt: img.alt, isMain: img.isMain, position: i });
          }
        }

        await saveProductImages(productId, uploadedImages);
      }

      if (mode === 'create' && productId) {
        router.push(`/admin/produits/${productId}`);
      }
    } catch (e) {
      setError('Erreur inattendue. Réessayez.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id || !confirm('Supprimer ce produit ? Cette action est irréversible.')) return;
    const result = await deleteProduct(form.id);
    if (result.error) {
      setError(result.error);
    } else {
      router.push('/admin/produits');
    }
  };

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === form.status)!;

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/produits"
            className="p-2 rounded-lg hover:bg-gray-200/50 transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-500" />
          </Link>
          <h2 className="text-lg font-semibold text-ink">
            {mode === 'create' ? 'Nouveau produit' : form.name || 'Modifier le produit'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {mode === 'edit' && (
            <>
              <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="Dupliquer">
                <Copy size={18} />
              </button>
              <button onClick={handleDelete} className="p-2 rounded-lg text-gray-400 hover:text-coral-500 hover:bg-coral-50 transition-colors" title="Supprimer">
                <Trash2 size={18} />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
            </>
          )}
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Eye size={16} />
            <span className="hidden sm:inline">Aperçu</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-jungle-600 text-white rounded-lg text-sm font-medium hover:bg-jungle-700 transition-colors disabled:opacity-40"
          >
            <Save size={16} />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="px-4 py-3 bg-coral-50 border border-coral-200 rounded-lg text-sm text-coral-700">
          {error}
        </div>
      )}

      {/* ── Layout 2 colonnes ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Colonne principale ───────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <Section title="Informations générales">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du produit <span className="text-coral-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Ex: Magnet Saint-Denis"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug URL
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">/boutique/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => {
                    setAutoSlug(false);
                    update('slug', e.target.value);
                  }}
                  placeholder="magnet-saint-denis"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={5}
                placeholder="Description détaillée du produit..."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 resize-y"
              />
              <p className="text-xs text-gray-400 mt-1">
                Supporte le Markdown. Un éditeur riche sera ajouté bientôt.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description courte
              </label>
              <textarea
                value={form.shortDescription}
                onChange={(e) => update('shortDescription', e.target.value)}
                rows={2}
                placeholder="Résumé en une ou deux phrases..."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 resize-y"
              />
            </div>
          </Section>

          {/* Médias */}
          <Section title="Médias">
            <ImageUploadZone
              images={form.images}
              onChange={(images) => update('images', images)}
            />
          </Section>

          {/* Tarification */}
          <Section title="Tarification">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix régulier (€) <span className="text-coral-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.price}
                    onChange={(e) => update('price', e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-3 pr-8 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    €
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix promotionnel (€)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.salePrice}
                    onChange={(e) => update('salePrice', e.target.value)}
                    placeholder="—"
                    className="w-full pl-3 pr-8 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    €
                  </span>
                </div>
              </div>
            </div>
            {form.salePrice && form.price && (
              <p className="text-xs text-jungle-600">
                Réduction de{' '}
                {Math.round(
                  ((parseFloat(form.price.replace(',', '.')) -
                    parseFloat(form.salePrice.replace(',', '.'))) /
                    parseFloat(form.price.replace(',', '.'))) *
                    100
                ) || 0}
                %
              </p>
            )}
          </Section>

          {/* Inventaire */}
          <Section title="Inventaire">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU (référence)
              </label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => update('sku', e.target.value)}
                placeholder="ID-MAG-SDN-001"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="manage-stock"
                checked={form.manageStock}
                onChange={(e) => update('manageStock', e.target.checked)}
                className="rounded border-gray-300 text-jungle-600 focus:ring-jungle-500"
              />
              <label htmlFor="manage-stock" className="text-sm text-gray-700">
                Gérer le stock pour ce produit
              </label>
            </div>

            {form.manageStock && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-7">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantité en stock
                  </label>
                  <input
                    type="number"
                    value={form.stockQuantity}
                    onChange={(e) => update('stockQuantity', e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seuil alerte stock
                  </label>
                  <input
                    type="number"
                    value={form.lowStockThreshold}
                    onChange={(e) =>
                      update('lowStockThreshold', e.target.value)
                    }
                    placeholder="5"
                    min="0"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poids (g)
              </label>
              <input
                type="text"
                value={form.weight}
                onChange={(e) => update('weight', e.target.value)}
                placeholder="Ex: 25"
                className="w-full sm:w-40 px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Utilisé pour le calcul des frais de livraison
              </p>
            </div>
          </Section>

          {/* Variantes */}
          <Section title="Variantes" defaultOpen={false}>
            <p className="text-xs text-gray-500 -mt-2 mb-2">
              Ajoutez des attributs (taille, couleur...) pour générer des variantes du produit.
            </p>
            <VariantManager
              attributes={form.attributes}
              variants={form.variants}
              onAttributesChange={(attrs) => update('attributes', attrs)}
              onVariantsChange={(vars) => update('variants', vars)}
            />
          </Section>

          {/* SEO */}
          <Section title="SEO" defaultOpen={mode === 'edit'}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta title
              </label>
              <input
                type="text"
                value={form.metaTitle}
                onChange={(e) => update('metaTitle', e.target.value)}
                placeholder={`${form.name || 'Nom du produit'} | Island Dreams`}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
              />
              <p className={cn(
                'text-xs mt-1',
                (form.metaTitle || '').length > 60 ? 'text-coral-500' : 'text-gray-400'
              )}>
                {(form.metaTitle || '').length}/60 caractères
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta description
              </label>
              <textarea
                value={form.metaDescription}
                onChange={(e) => update('metaDescription', e.target.value)}
                rows={3}
                placeholder="Description pour les moteurs de recherche..."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 resize-y"
              />
              <p className={cn(
                'text-xs mt-1',
                (form.metaDescription || '').length > 160 ? 'text-coral-500' : 'text-gray-400'
              )}>
                {(form.metaDescription || '').length}/160 caractères
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot-clé principal
              </label>
              <input
                type="text"
                value={form.focusKeyword}
                onChange={(e) => update('focusKeyword', e.target.value)}
                placeholder="Ex: magnet réunion"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
              />
            </div>

            {/* Google Preview */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">
                Aperçu Google
              </p>
              <div className="space-y-0.5">
                <p className="text-[#1a0dab] text-base leading-tight truncate">
                  {form.metaTitle || `${form.name || 'Nom du produit'} | Island Dreams`}
                </p>
                <p className="text-[#006621] text-xs truncate">
                  islanddreams.re/boutique/{form.slug || 'slug-produit'}
                </p>
                <p className="text-[#545454] text-xs leading-relaxed line-clamp-2">
                  {form.metaDescription || form.shortDescription || 'Ajoutez une meta description pour améliorer le référencement.'}
                </p>
              </div>
            </div>
          </Section>
        </div>

        {/* ── Colonne latérale ─────────────────────────────── */}
        <div className="space-y-6">
          {/* Statut & Visibilité */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-ink">
                Statut & Visibilité
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Statut
                </label>
                <div className="space-y-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors',
                        form.status === opt.value
                          ? 'bg-gray-50 ring-1 ring-gray-200'
                          : 'hover:bg-gray-50'
                      )}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={opt.value}
                        checked={form.status === opt.value}
                        onChange={() => update('status', opt.value)}
                        className="sr-only"
                      />
                      <span
                        className={cn('w-2.5 h-2.5 rounded-full', opt.color)}
                      />
                      <span className="text-sm text-ink">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => update('featured', e.target.checked)}
                    className="rounded border-gray-300 text-sun-500 focus:ring-sun-400"
                  />
                  <span className="text-sm text-gray-700">
                    Produit mis en avant
                  </span>
                </label>
                <p className="text-xs text-gray-400 mt-1 ml-7">
                  Affiché sur la home et en priorité
                </p>
              </div>
            </div>
          </div>

          {/* Organisation */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-ink">Organisation</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Catégorie
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    update('category', e.target.value as ProductCategory)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-700"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-gray-400 hover:text-coral-500"
                      >
                        <span className="sr-only">Supprimer</span>
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Ajouter un tag + Entrée"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
                />
              </div>
            </div>
          </div>

          {/* Résumé */}
          <div className="bg-gray-100/50 rounded-xl p-5 space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Résumé
            </p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Statut</span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      currentStatus.color
                    )}
                  />
                  {currentStatus.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Catégorie</span>
                <span className="text-ink">
                  {CATEGORIES.find((c) => c.value === form.category)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Prix</span>
                <span className="text-ink font-medium">
                  {form.price ? `${form.price} €` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Images</span>
                <span className="text-ink">{form.images.length}</span>
              </div>
              {form.variants.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Variantes</span>
                  <span className="text-ink">
                    {form.variants.filter((v) => v.enabled).length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
