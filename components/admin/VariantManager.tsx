'use client';

import { Plus, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Types ───────────────────────────────────────────────── */

export type Attribute = {
  id: string;
  name: string;
  values: string[];
};

export type Variant = {
  id: string;
  combination: Record<string, string>;
  price: string;
  sku: string;
  stock: string;
  enabled: boolean;
};

type Props = {
  attributes: Attribute[];
  variants: Variant[];
  onAttributesChange: (attributes: Attribute[]) => void;
  onVariantsChange: (variants: Variant[]) => void;
};

let nextId = 1;
function uid() {
  return `var-${Date.now()}-${nextId++}`;
}

/* ── Helpers ─────────────────────────────────────────────── */

function generateVariants(attributes: Attribute[]): Variant[] {
  const validAttrs = attributes.filter(
    (a) => a.name.trim() && a.values.length > 0
  );
  if (validAttrs.length === 0) return [];

  // Produit cartésien
  const combos = validAttrs.reduce<Record<string, string>[]>(
    (acc, attr) => {
      if (acc.length === 0) {
        return attr.values.map((v) => ({ [attr.name]: v }));
      }
      return acc.flatMap((combo) =>
        attr.values.map((v) => ({ ...combo, [attr.name]: v }))
      );
    },
    []
  );

  return combos.map((combination) => ({
    id: uid(),
    combination,
    price: '',
    sku: '',
    stock: '',
    enabled: true,
  }));
}

function combinationLabel(combo: Record<string, string>): string {
  return Object.values(combo).join(' / ');
}

/* ── Composant ───────────────────────────────────────────── */

export function VariantManager({
  attributes,
  variants,
  onAttributesChange,
  onVariantsChange,
}: Props) {
  const addAttribute = () => {
    onAttributesChange([
      ...attributes,
      { id: uid(), name: '', values: [] },
    ]);
  };

  const removeAttribute = (id: string) => {
    const updated = attributes.filter((a) => a.id !== id);
    onAttributesChange(updated);
    onVariantsChange(generateVariants(updated));
  };

  const updateAttributeName = (id: string, name: string) => {
    onAttributesChange(
      attributes.map((a) => (a.id === id ? { ...a, name } : a))
    );
  };

  const addValue = (attrId: string, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const updated = attributes.map((a) =>
      a.id === attrId && !a.values.includes(trimmed)
        ? { ...a, values: [...a.values, trimmed] }
        : a
    );
    onAttributesChange(updated);
    onVariantsChange(generateVariants(updated));
  };

  const removeValue = (attrId: string, value: string) => {
    const updated = attributes.map((a) =>
      a.id === attrId
        ? { ...a, values: a.values.filter((v) => v !== value) }
        : a
    );
    onAttributesChange(updated);
    onVariantsChange(generateVariants(updated));
  };

  const updateVariant = (
    variantId: string,
    field: 'price' | 'sku' | 'stock',
    value: string
  ) => {
    onVariantsChange(
      variants.map((v) =>
        v.id === variantId ? { ...v, [field]: value } : v
      )
    );
  };

  const toggleVariant = (variantId: string) => {
    onVariantsChange(
      variants.map((v) =>
        v.id === variantId ? { ...v, enabled: !v.enabled } : v
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Attributs */}
      <div className="space-y-4">
        {attributes.map((attr) => (
          <div
            key={attr.id}
            className="border border-gray-200 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={attr.name}
                onChange={(e) => updateAttributeName(attr.id, e.target.value)}
                placeholder="Nom (ex: Taille, Couleur)"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
              />
              <button
                onClick={() => removeAttribute(attr.id)}
                className="p-2 rounded-lg text-gray-400 hover:text-coral-500 hover:bg-coral-50 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Valeurs */}
            <div className="flex flex-wrap gap-2">
              {attr.values.map((val) => (
                <span
                  key={val}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-sm text-ink"
                >
                  {val}
                  <button
                    onClick={() => removeValue(attr.id, val)}
                    className="text-gray-400 hover:text-coral-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Ajouter une valeur + Entrée"
                className="px-2.5 py-1 text-sm border-none focus:outline-none bg-transparent min-w-[160px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addValue(attr.id, e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addAttribute}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-jungle-600 hover:bg-jungle-50 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Ajouter un attribut
        </button>
      </div>

      {/* Table variantes */}
      {variants.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-medium text-ink">
              {variants.length} variante{variants.length > 1 ? 's' : ''} générée
              {variants.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-4 py-2 font-medium w-8" />
                  <th className="px-4 py-2 font-medium">Variante</th>
                  <th className="px-4 py-2 font-medium">Prix</th>
                  <th className="px-4 py-2 font-medium">SKU</th>
                  <th className="px-4 py-2 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {variants.map((variant) => (
                  <tr
                    key={variant.id}
                    className={cn(
                      'transition-colors',
                      !variant.enabled && 'opacity-40'
                    )}
                  >
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={variant.enabled}
                        onChange={() => toggleVariant(variant.id)}
                        className="rounded border-gray-300 text-jungle-600 focus:ring-jungle-500"
                      />
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-ink">
                      {combinationLabel(variant.combination)}
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(variant.id, 'price', e.target.value)
                        }
                        placeholder="—"
                        disabled={!variant.enabled}
                        className="w-20 px-2 py-1 rounded border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500/30 disabled:bg-gray-50"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariant(variant.id, 'sku', e.target.value)
                        }
                        placeholder="—"
                        disabled={!variant.enabled}
                        className="w-24 px-2 py-1 rounded border border-gray-200 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-jungle-500/30 disabled:bg-gray-50"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariant(variant.id, 'stock', e.target.value)
                        }
                        placeholder="—"
                        disabled={!variant.enabled}
                        className="w-16 px-2 py-1 rounded border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500/30 disabled:bg-gray-50"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
