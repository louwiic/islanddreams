'use client';

import { useState } from 'react';
import { Wrench, Eye, EyeOff, Save } from 'lucide-react';

type Props = { enabled: boolean; pin: string };

export function MaintenanceToggle({ enabled: initialEnabled, pin: initialPin }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pin, setPin] = useState(initialPin);
  const [showPin, setShowPin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/admin/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled, pin }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section className={`rounded-xl border-2 overflow-hidden transition-colors ${
      enabled ? 'border-coral-400 bg-coral-50/30' : 'border-gray-200 bg-white'
    }`}>
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wrench size={18} className={enabled ? 'text-coral-500' : 'text-gray-400'} />
          <div>
            <h2 className="font-semibold text-ink">Mode maintenance</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {enabled ? 'Site inaccessible au public — accès par code PIN uniquement' : 'Site accessible normalement'}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-coral-500' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Code PIN d&apos;accès
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-[200px]">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                saved
                  ? 'bg-jungle-100 text-jungle-700'
                  : 'bg-jungle-600 hover:bg-jungle-700 text-white'
              } disabled:opacity-50`}
            >
              <Save size={14} />
              {saved ? 'Enregistré !' : saving ? '...' : 'Enregistrer'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Partage ce code au client pour qu&apos;il puisse voir le site en maintenance
          </p>
        </div>

        {enabled && (
          <div className="flex items-start gap-2 p-3 bg-coral-50 border border-coral-200 rounded-lg">
            <Wrench size={14} className="text-coral-500 mt-0.5 shrink-0" />
            <p className="text-xs text-coral-700">
              Le site affiche actuellement la page de maintenance. Les visiteurs doivent saisir le code PIN pour accéder au site. Les routes <strong>/admin</strong> restent accessibles.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
