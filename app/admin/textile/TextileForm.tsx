'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';

type TextileData = {
  id?: string;
  product_name: string;
  image_url: string;
  product_link: string;
  position: number;
  is_active: boolean;
};

const defaults: TextileData = {
  product_name: '',
  image_url: '',
  product_link: '/boutique',
  position: 0,
  is_active: true,
};

export function TextileForm({ initialData }: { initialData?: TextileData }) {
  const router = useRouter();
  const [form, setForm] = useState<TextileData>(initialData ?? defaults);
  const [saving, setSaving] = useState(false);

  const update = (field: keyof TextileData, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    await fetch('/api/admin/textile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setSaving(false);
    router.push('/admin/textile');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-ink mb-1">Nom du produit *</label>
        <input
          type="text"
          value={form.product_name}
          onChange={(e) => update('product_name', e.target.value)}
          placeholder="Serviette Plage Saint-Gilles"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Image (URL) *</label>
        <input
          type="text"
          value={form.image_url}
          onChange={(e) => update('image_url', e.target.value)}
          placeholder="/images/products/textile/serviette.png ou https://..."
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500"
        />
        {form.image_url && (
          <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden bg-gray-100 border">
            <img src={form.image_url} alt="Aperçu" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Lien produit</label>
        <input
          type="text"
          value={form.product_link}
          onChange={(e) => update('product_link', e.target.value)}
          placeholder="/boutique/serviette-plage-saint-gilles"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Position</label>
          <input
            type="number"
            value={form.position}
            onChange={(e) => update('position', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500"
          />
          <p className="text-xs text-gray-400 mt-1">Ordre d&apos;affichage (0 = premier)</p>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => update('is_active', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-jungle-600 focus:ring-jungle-500"
            />
            <span className="text-sm font-medium text-ink">Actif</span>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || !form.product_name || !form.image_url}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-jungle-600 hover:bg-jungle-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/textile')}
          className="px-4 py-2.5 text-sm text-gray-500 hover:text-ink transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
