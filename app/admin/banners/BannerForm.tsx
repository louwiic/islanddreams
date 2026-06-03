'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Upload } from 'lucide-react';
import { uploadProductImage } from '@/lib/actions/images';

type BannerData = {
  id?: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  event_slug?: string;
  event_product_ids?: string[];
  start_date: string;
  end_date: string;
  priority: number;
  is_active: boolean;
};

type BannerProduct = {
  id: string;
  name: string;
  slug: string;
  status: string | null;
  tags?: string[] | null;
  image_url?: string | null;
};

const defaults: BannerData = {
  title: '',
  subtitle: '',
  image_url: '',
  cta_text: 'Découvrir',
  cta_link: '/boutique',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  priority: 0,
  is_active: true,
};

function productSlugFromLink(link: string) {
  const eventMatch = link.match(/^#evenement-special:([^/?#]+)/);
  if (eventMatch) return eventMatch[1];
  const eventQueryMatch = link.match(/[?&]evenement=([^&#]+)/);
  if (eventQueryMatch) return eventQueryMatch[1];
  return '';
}

function clickActionFromLink(link: string) {
  return link.startsWith('#evenement-special:') ? 'event-block' : 'url';
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function eventSlugFromData(data: BannerData) {
  return data.event_slug || productSlugFromLink(data.cta_link) || slugify(data.title || 'evenement');
}

export function BannerForm({
  initialData,
  products = [],
}: {
  initialData?: BannerData;
  products?: BannerProduct[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<BannerData>(initialData ?? defaults);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [eventSlug, setEventSlug] = useState(eventSlugFromData(initialData ?? defaults));
  const [previousEventSlug] = useState(eventSlugFromData(initialData ?? defaults));
  const [eventProductIds, setEventProductIds] = useState<Set<string>>(
    () => new Set(initialData?.event_product_ids ?? [])
  );
  const [clickAction, setClickAction] = useState<'event-block' | 'url'>(
    clickActionFromLink(form.cta_link)
  );

  const update = (field: keyof BannerData, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleActionChange = (action: 'event-block' | 'url') => {
    setClickAction(action);
    setForm((prev) => ({
      ...prev,
      cta_link:
        action === 'event-block'
          ? `#evenement-special:${eventSlug}`
          : `/boutique?evenement=${eventSlug}`,
    }));
  };

  const handleEventSlugChange = (value: string) => {
    const nextSlug = slugify(value);
    setEventSlug(nextSlug);
    setForm((prev) => ({
      ...prev,
      cta_link:
        clickAction === 'event-block'
          ? `#evenement-special:${nextSlug}`
          : prev.cta_link === `/boutique?evenement=${eventSlug}` || prev.cta_link.startsWith('/boutique?evenement=')
            ? `/boutique?evenement=${nextSlug}`
            : prev.cta_link,
    }));
  };

  const toggleEventProduct = (productId: string) => {
    setEventProductIds((current) => {
      const next = new Set(current);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Le fichier doit être une image.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const result = await uploadProductImage('bannieres-evenements', formData);
    setUploading(false);

    if (result.error) {
      alert(`Erreur upload : ${result.error}`);
      return;
    }

    update('image_url', result.url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    await fetch('/api/admin/banners/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        event_slug: eventSlug,
        previous_event_slug: previousEventSlug,
        event_product_ids: Array.from(eventProductIds),
      }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => router.push('/admin/banners'), 500);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      {/* Titre */}
      <div>
        <label className="block text-sm font-medium text-ink mb-1">Titre *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Fèt Maman 2026"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500"
        />
      </div>

      {/* Sous-titre */}
      <div>
        <label className="block text-sm font-medium text-ink mb-1">Sous-titre</label>
        <input
          type="text"
          value={form.subtitle}
          onChange={(e) => update('subtitle', e.target.value)}
          placeholder="Offrez un souvenir péi unique"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500"
        />
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-ink mb-1">Image événement</label>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
          <input
            type="text"
            value={form.image_url}
            onChange={(e) => update('image_url', e.target.value)}
            placeholder="/images/products/mon-produit.png ou https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Importer
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">Image uploadée, chemin local ou URL externe</p>
        {form.image_url && (
          <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.image_url} alt="Aperçu" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {products.length > 0 && (
        <div className="rounded-xl border border-jungle-100 bg-jungle-50/50 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Catégorie spéciale boutique
            </label>
            <input
              type="text"
              value={eventSlug}
              onChange={(e) => handleEventSlugChange(e.target.value)}
              placeholder="sakifo-2026"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500 bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lien boutique : /boutique?evenement={eventSlug || 'evenement'}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-ink mb-2">
              Produits dans cette catégorie événement
            </p>
            <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
              {products.map((product) => (
                <label
                  key={product.id}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={eventProductIds.has(product.id)}
                    onChange={() => toggleEventProduct(product.id)}
                    className="rounded border-gray-300 text-jungle-600 focus:ring-jungle-500"
                  />
                  {product.image_url && (
                    <span className="h-9 w-9 overflow-hidden rounded-md bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{product.name}</span>
                    {product.status !== 'publish' && (
                      <span className="text-xs text-gray-400">Non publié</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Texte du bouton</label>
          <input
            type="text"
            value={form.cta_text}
            onChange={(e) => update('cta_text', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Action au clic</label>
          <select
            value={clickAction}
            onChange={(e) => handleActionChange(e.target.value as 'event-block' | 'url')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500"
          >
            <option value="event-block">Descendre au bloc événement</option>
            <option value="url">Ouvrir une URL</option>
          </select>
        </div>
      </div>

      {clickAction === 'url' && (
        <div>
          <label className="block text-sm font-medium text-ink mb-1">URL à ouvrir</label>
          <input
            type="text"
            value={form.cta_link}
            onChange={(e) => update('cta_link', e.target.value)}
            placeholder="/boutique?categorie=textile ou https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500"
          />
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Date début *</label>
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => update('start_date', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Date fin *</label>
          <input
            type="date"
            value={form.end_date}
            onChange={(e) => update('end_date', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500"
          />
        </div>
      </div>

      {/* Priorité + Actif */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Priorité</label>
          <input
            type="number"
            value={form.priority}
            onChange={(e) => update('priority', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500"
          />
          <p className="text-xs text-gray-400 mt-1">Plus le chiffre est haut, plus la bannière est prioritaire</p>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => update('is_active', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-jungle-600 focus:ring-jungle-500"
            />
            <span className="text-sm font-medium text-ink">Bannière active</span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || !form.title}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-jungle-600 hover:bg-jungle-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Enregistrement...' : saved ? 'Enregistré !' : 'Enregistrer'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/banners')}
          className="px-4 py-2.5 text-sm text-gray-500 hover:text-ink transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
