'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Upload, X } from 'lucide-react';
import { uploadTextileImage } from '@/lib/actions/images';

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
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(initialData?.image_url ?? '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof TextileData, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const fd = new FormData();
    fd.append('file', file);
    const result = await uploadTextileImage(fd);

    setUploading(false);

    if (result.error) {
      alert(`Erreur upload : ${result.error}`);
      setPreview(form.image_url);
      return;
    }

    setForm((prev) => ({ ...prev, image_url: result.url }));
  }, [form.image_url]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

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
        <label className="block text-sm font-medium text-ink mb-2">Image *</label>

        {preview ? (
          <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-gray-200 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xs font-medium">Upload...</span>
              </div>
            )}
            {!uploading && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg bg-white/90 text-gray-700 hover:bg-white transition-colors"
                  title="Changer l'image"
                >
                  <Upload size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => { setPreview(''); update('image_url', ''); }}
                  className="p-1.5 rounded-lg bg-white/90 text-gray-700 hover:bg-coral-500 hover:text-white transition-colors"
                  title="Supprimer"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 hover:border-jungle-500 rounded-xl p-8 text-center cursor-pointer transition-colors hover:bg-jungle-50/30"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <Upload size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">Glisser ou cliquer pour uploader</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP</p>
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
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
          disabled={saving || uploading || !form.product_name || !form.image_url}
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
