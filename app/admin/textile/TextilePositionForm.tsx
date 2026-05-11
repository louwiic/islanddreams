'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Check } from 'lucide-react';

type ProductImage = { id: string; url: string; is_main: boolean; alt: string | null };

type Props = {
  id: string;
  position: number;
  isActive: boolean;
  images: ProductImage[];
  currentImageUrl: string | null;
};

export function TextilePositionForm({ id, position, isActive, images, currentImageUrl }: Props) {
  const router = useRouter();
  const [pos, setPos] = useState(position);
  const [active, setActive] = useState(isActive);
  const [imageUrl, setImageUrl] = useState<string | null>(
    currentImageUrl ?? images.find((i) => i.is_main)?.url ?? images[0]?.url ?? null
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/admin/textile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, position: pos, is_active: active, image_url: imageUrl }),
    });
    setSaving(false);
    router.push('/admin/textile');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">

      {/* Choix photo — toujours visible même si 1 seule image */}
      {images.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Photo affichée dans le carousel
            </p>
          </div>
          <div className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setImageUrl(img.url)}
                className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-colors ${
                  imageUrl === img.url
                    ? 'border-jungle-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt ?? ''} className="w-full h-full object-cover" />
                {imageUrl === img.url && (
                  <div className="absolute inset-0 bg-jungle-500/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-jungle-500 flex items-center justify-center shadow">
                      <Check size={14} className="text-white" />
                    </div>
                  </div>
                )}
                {img.is_main && (
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-ink/70 text-white text-[9px] font-bold rounded">
                    Principale
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Position + activation */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Position</label>
          <input
            type="number"
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            min={0}
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500"
          />
          <p className="text-xs text-gray-400 mt-1">Ordre d&apos;affichage (0 = premier)</p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-jungle-600 focus:ring-jungle-500"
          />
          <span className="text-sm font-medium text-ink">Actif</span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
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
