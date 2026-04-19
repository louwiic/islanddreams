'use client';

import { useState } from 'react';
import { Save, Globe, Search, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateSettings } from '@/lib/actions/settings';

type Props = {
  initialSettings: Record<string, string>;
};

export function SeoManager({ initialSettings }: Props) {
  const [settings, setSettings] = useState({
    titleTemplate: initialSettings.seo_title_template || '{{product_name}} | Island Dreams — Souvenirs de La Réunion',
    defaultDescription: initialSettings.seo_default_description || 'Souvenirs illustrés de La Réunion — magnets, stickers, textile, décoration.',
    siteName: initialSettings.seo_site_name || 'Island Dreams',
    locale: initialSettings.seo_locale || 'fr_RE',
    ogImage: initialSettings.seo_og_image || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof typeof settings, value: string) => {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateSettings({
      seo_title_template: settings.titleTemplate,
      seo_default_description: settings.defaultDescription,
      seo_site_name: settings.siteName,
      seo_locale: settings.locale,
      seo_og_image: settings.ogImage,
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Template titre */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <Search size={18} className="text-jungle-600" />
          <h2 className="font-semibold text-ink">Référencement (SEO)</h2>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du site
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => update('siteName', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template titre produit
            </label>
            <input
              type="text"
              value={settings.titleTemplate}
              onChange={(e) => update('titleTemplate', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Variables : {'{{product_name}}'}, {'{{category}}'}, {'{{site_name}}'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description par défaut du site
            </label>
            <textarea
              value={settings.defaultDescription}
              onChange={(e) => update('defaultDescription', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 resize-y"
            />
            <p className={cn(
              'text-xs mt-1',
              settings.defaultDescription.length > 160 ? 'text-coral-500' : 'text-gray-400'
            )}>
              {settings.defaultDescription.length}/160 caractères
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Locale
              </label>
              <select
                value={settings.locale}
                onChange={(e) => update('locale', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 bg-white"
              >
                <option value="fr_RE">Français (La Réunion)</option>
                <option value="fr_FR">Français (France)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Open Graph */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <Share2 size={18} className="text-ocean-600" />
          <h2 className="font-semibold text-ink">Open Graph (réseaux sociaux)</h2>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image OG par défaut
            </label>
            <input
              type="text"
              value={settings.ogImage}
              onChange={(e) => update('ogImage', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Image affichée quand un lien est partagé sans image spécifique (1200x630px recommandé)
            </p>
          </div>

          {/* Preview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-4 pt-3">
              Aperçu partage Facebook / LinkedIn
            </p>
            <div className="p-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden max-w-sm">
                <div className="bg-gray-100 aspect-[1200/630] flex items-center justify-center">
                  {settings.ogImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={settings.ogImage}
                      alt="OG preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Globe size={32} className="text-gray-300" />
                  )}
                </div>
                <div className="p-3 bg-gray-50">
                  <p className="text-[10px] text-gray-400 uppercase">
                    islanddreams.re
                  </p>
                  <p className="text-sm font-medium text-ink mt-0.5">
                    {settings.siteName} — L&apos;île en souvenirs
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {settings.defaultDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Preview */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <Globe size={18} className="text-gray-500" />
          <h2 className="font-semibold text-ink">Aperçu Google — Page d&apos;accueil</h2>
        </div>
        <div className="p-6">
          <div className="space-y-0.5">
            <p className="text-[#1a0dab] text-base leading-tight">
              {settings.siteName} — L&apos;île en souvenirs
            </p>
            <p className="text-[#006621] text-xs">
              https://islanddreams.re
            </p>
            <p className="text-[#545454] text-xs leading-relaxed line-clamp-2">
              {settings.defaultDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center justify-between">
        {saved && (
          <p className="text-sm text-jungle-600">Paramètres enregistrés.</p>
        )}
        <div className="flex-1" />
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-jungle-600 text-white rounded-lg text-sm font-medium hover:bg-jungle-700 transition-colors disabled:opacity-40"
        >
          <Save size={16} />
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
