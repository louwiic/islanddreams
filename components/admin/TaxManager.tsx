'use client';

import { useState } from 'react';
import { Calculator, CircleAlert, Plus, Save, Trash2 } from 'lucide-react';
import { saveTaxConfiguration } from '@/lib/actions/taxes';
import type { TaxConfiguration, TaxMode, TaxZone } from '@/lib/tax/types';

function newZone(): TaxZone {
  return {
    id: crypto.randomUUID(),
    name: 'Nouvelle zone',
    countries: [],
    postcodePrefixes: [],
    mode: 'not_collected',
    rate: 0,
    taxShipping: false,
    enabled: true,
    notice: 'Les taxes et frais d’importation éventuels restent à la charge du destinataire.',
  };
}

const MODE_LABELS: Record<TaxMode, string> = {
  included: 'Taxe incluse dans le prix',
  added: 'Taxe ajoutée au paiement',
  not_collected: 'Vente HT — taxe non collectée',
};

export function TaxManager({
  initialConfiguration,
}: {
  initialConfiguration: TaxConfiguration;
}) {
  const [configuration, setConfiguration] = useState(initialConfiguration);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const updateZone = (id: string, update: Partial<TaxZone>) => {
    setConfiguration((current) => ({
      ...current,
      zones: current.zones.map((zone) => (zone.id === id ? { ...zone, ...update } : zone)),
    }));
    setMessage('');
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const result = await saveTaxConfiguration(configuration);
    setSaving(false);
    setMessage(result.error || 'Configuration fiscale enregistrée.');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Taxes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configurez le prix TTC ou HT appliqué selon l’adresse de livraison.
        </p>
      </div>

      <div className="flex gap-3 rounded-xl border border-sun-200 bg-sun-50 p-4 text-sm text-ink/75">
        <CircleAlert size={18} className="mt-0.5 shrink-0 text-sun-600" />
        <p>
          Activez la collecte d’une taxe étrangère uniquement après validation de votre immatriculation
          avec votre comptable. Stripe Tax ne calcule pas automatiquement la fiscalité réunionnaise.
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
          <Calculator size={18} className="text-jungle-600" />
          <h2 className="font-semibold text-ink">Prix de référence</h2>
        </div>
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <label className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-4">
            <span>
              <span className="block text-sm font-medium text-gray-700">Calcul fiscal actif</span>
              <span className="block text-xs text-gray-400">Désactiver conserve les prix actuels.</span>
            </span>
            <input
              type="checkbox"
              checked={configuration.enabled}
              onChange={(event) => setConfiguration((current) => ({ ...current, enabled: event.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-jungle-600"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-4">
            <span>
              <span className="block text-sm font-medium text-gray-700">Prix catalogue TTC</span>
              <span className="block text-xs text-gray-400">Les prix enregistrés comprennent la TVA locale.</span>
            </span>
            <input
              type="checkbox"
              checked={configuration.catalogPricesIncludeTax}
              onChange={(event) => setConfiguration((current) => ({
                ...current,
                catalogPricesIncludeTax: event.target.checked,
              }))}
              className="h-4 w-4 rounded border-gray-300 text-jungle-600"
            />
          </label>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              TVA incluse dans les prix catalogue
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={configuration.catalogTaxRate}
                onChange={(event) => setConfiguration((current) => ({
                  ...current,
                  catalogTaxRate: Number(event.target.value),
                }))}
                className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Utilisé pour retrouver le prix HT lors d’une exportation.
            </p>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink">Zones fiscales</h2>
          <p className="text-xs text-gray-400">La première zone correspondante est appliquée.</p>
        </div>
        <button
          type="button"
          onClick={() => setConfiguration((current) => ({ ...current, zones: [...current.zones, newZone()] }))}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-50"
        >
          <Plus size={15} /> Ajouter une zone
        </button>
      </div>

      {configuration.zones.map((zone, index) => (
        <section key={zone.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-jungle-50 text-xs font-bold text-jungle-700">
                {index + 1}
              </span>
              <input
                value={zone.name}
                onChange={(event) => updateZone(zone.id, { name: event.target.value })}
                className="border-0 bg-transparent font-semibold text-ink outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-gray-500">
                <input
                  type="checkbox"
                  checked={zone.enabled}
                  onChange={(event) => updateZone(zone.id, { enabled: event.target.checked })}
                  className="rounded border-gray-300 text-jungle-600"
                />
                Active
              </label>
              <button
                type="button"
                onClick={() => setConfiguration((current) => ({
                  ...current,
                  zones: current.zones.filter((item) => item.id !== zone.id),
                }))}
                className="rounded-lg p-2 text-gray-300 hover:bg-coral-50 hover:text-coral-500"
                aria-label={`Supprimer ${zone.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Pays</label>
              <input
                value={zone.countries.join(', ')}
                onChange={(event) => updateZone(zone.id, {
                  countries: event.target.value.split(',').map((value) => value.trim().toUpperCase()).filter(Boolean),
                })}
                placeholder="RE ou FR, BE, DE ou *"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase"
              />
              <p className="mt-1 text-xs text-gray-400">Codes ISO séparés par des virgules. * = autres pays.</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Préfixes postaux facultatifs</label>
              <input
                value={zone.postcodePrefixes.join(', ')}
                onChange={(event) => updateZone(zone.id, {
                  postcodePrefixes: event.target.value.split(',').map((value) => value.trim()).filter(Boolean),
                })}
                placeholder="Ex. 971, 972"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Traitement</label>
              <select
                value={zone.mode}
                onChange={(event) => updateZone(zone.id, { mode: event.target.value as TaxMode })}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                {Object.entries(MODE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Taux</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={zone.rate}
                  disabled={zone.mode === 'not_collected'}
                  onChange={(event) => updateZone(zone.id, { rate: Number(event.target.value) })}
                  className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={zone.taxShipping}
                disabled={zone.mode === 'not_collected'}
                onChange={(event) => updateZone(zone.id, { taxShipping: event.target.checked })}
                className="rounded border-gray-300 text-jungle-600"
              />
              Appliquer également la taxe à la livraison
            </label>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Message affiché au client</label>
              <textarea
                rows={2}
                value={zone.notice}
                onChange={(event) => updateZone(zone.id, { notice: event.target.value })}
                className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>
      ))}

      <div className="flex items-center justify-between pb-8">
        <p className={message.includes('enregistrée') ? 'text-sm text-jungle-600' : 'text-sm text-coral-600'}>
          {message}
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-jungle-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-jungle-700 disabled:opacity-50"
        >
          <Save size={16} /> {saving ? 'Enregistrement…' : 'Enregistrer les taxes'}
        </button>
      </div>
    </div>
  );
}
