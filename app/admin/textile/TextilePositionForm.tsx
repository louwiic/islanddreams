'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';

type Props = { id: string; position: number; isActive: boolean };

export function TextilePositionForm({ id, position, isActive }: Props) {
  const router = useRouter();
  const [pos, setPos] = useState(position);
  const [active, setActive] = useState(isActive);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/admin/textile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, position: pos, is_active: active }),
    });
    setSaving(false);
    router.push('/admin/textile');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-ink mb-1">Position</label>
        <input
          type="number"
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          min={0}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500"
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

      <div className="flex items-center gap-3 pt-2">
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
