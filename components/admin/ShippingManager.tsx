'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Truck,
  MapPin,
  Save,
  ToggleLeft,
  ToggleRight,
  Pen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  updateShippingMethod,
  toggleShippingZone,
  type ShippingZone,
} from '@/lib/actions/shipping';

export function ShippingManager({
  initialZones,
}: {
  initialZones: ShippingZone[];
}) {
  const router = useRouter();
  const [zones, setZones] = useState(initialZones);
  const [editingMethod, setEditingMethod] = useState<string | null>(null);
  const [editCost, setEditCost] = useState('');
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleToggleZone = async (zoneId: string, enabled: boolean) => {
    await toggleShippingZone(zoneId, !enabled);
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, enabled: !enabled } : z))
    );
  };

  const startEdit = (method: ShippingZone['methods'][0]) => {
    setEditingMethod(method.id);
    setEditCost(method.cost.toString());
    setEditName(method.name);
  };

  const handleSaveMethod = async (methodId: string) => {
    setSaving(true);
    await updateShippingMethod(methodId, {
      name: editName,
      cost: parseFloat(editCost) || 0,
    });
    setSaving(false);
    setEditingMethod(null);
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <p className="text-sm text-gray-500">
        Configuration des zones et tarifs de livraison, identiques à votre
        boutique WooCommerce.
      </p>

      {zones.map((zone) => (
        <div
          key={zone.id}
          className={cn(
            'bg-white rounded-xl border border-gray-200 overflow-hidden',
            !zone.enabled && 'opacity-50'
          )}
        >
          {/* Zone header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-jungle-600" />
              <div>
                <h3 className="font-semibold text-ink">{zone.name}</h3>
                {zone.description && (
                  <p className="text-xs text-gray-400 mt-0.5 max-w-md">
                    {zone.description}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleToggleZone(zone.id, zone.enabled ?? true)}
              className="p-1"
              title={zone.enabled ? 'Désactiver' : 'Activer'}
            >
              {zone.enabled ? (
                <ToggleRight size={28} className="text-jungle-500" />
              ) : (
                <ToggleLeft size={28} className="text-gray-300" />
              )}
            </button>
          </div>

          {/* Codes postaux */}
          <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100">
            <p className="text-xs text-gray-500">
              <span className="font-medium">Codes postaux : </span>
              {zone.postcodes.map((p) => (
                <span
                  key={p.id}
                  className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-[11px] font-mono mr-1 mb-1"
                >
                  {p.country === 'FR' && p.postcode_pattern === '*'
                    ? 'France entière'
                    : `${p.country} ${p.postcode_pattern}`}
                </span>
              ))}
            </p>
          </div>

          {/* Méthodes */}
          <div className="divide-y divide-gray-50">
            {zone.methods.map((method) => (
              <div
                key={method.id}
                className="px-5 py-3 flex items-center justify-between"
              >
                {editingMethod === method.id ? (
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-2 py-1 rounded border border-gray-200 text-sm flex-1 max-w-[200px] focus:outline-none focus:ring-1 focus:ring-jungle-500/30"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={editCost}
                        onChange={(e) => setEditCost(e.target.value)}
                        step="0.01"
                        className="w-20 px-2 py-1 rounded border border-gray-200 text-sm text-right focus:outline-none focus:ring-1 focus:ring-jungle-500/30"
                      />
                      <span className="text-sm text-gray-400">€</span>
                    </div>
                    <button
                      onClick={() => handleSaveMethod(method.id)}
                      disabled={saving}
                      className="flex items-center gap-1 px-3 py-1 bg-jungle-600 text-white rounded text-xs font-medium hover:bg-jungle-700 disabled:opacity-50"
                    >
                      <Save size={12} />
                      OK
                    </button>
                    <button
                      onClick={() => setEditingMethod(null)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <Truck size={14} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {method.name}
                        </p>
                        {method.requires_signature && (
                          <p className="text-[10px] text-ocean-600">
                            Avec signature
                          </p>
                        )}
                        {method.free_above && (
                          <p className="text-[10px] text-jungle-600">
                            Gratuit au dessus de {method.free_above} €
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-ink">
                        {method.cost.toFixed(2)} €
                      </span>
                      <button
                        onClick={() => startEdit(method)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Pen size={12} className="text-gray-400" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
