'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';

type BannerData = {
  id?: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  start_date: string;
  end_date: string;
  priority: number;
  is_active: boolean;
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

export function BannerForm({ initialData }: { initialData?: BannerData }) {
  const router = useRouter();
  const [form, setForm] = useState<BannerData>(initialData ?? defaults);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (field: keyof BannerData, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    await fetch('/api/admin/banners/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
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
        <label className="block text-sm font-medium text-ink mb-1">Image produit (URL)</label>
        <input
          type="text"
          value={form.image_url}
          onChange={(e) => update('image_url', e.target.value)}
          placeholder="/images/products/mon-produit.png ou https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500"
        />
        <p className="text-xs text-gray-400 mt-1">Chemin local (/images/...) ou URL externe</p>
        {form.image_url && (
          <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border">
            <img src={form.image_url} alt="Aperçu" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="grid grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium text-ink mb-1">Lien du bouton</label>
          <input
            type="text"
            value={form.cta_link}
            onChange={(e) => update('cta_link', e.target.value)}
            placeholder="/boutique?categorie=textile"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500"
          />
        </div>
      </div>

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
