'use client';

import { useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

const MAX_OPTIONS = 3;
const MAX_VARIANTS = 100;
const OPTION_SUGGESTIONS = ['Couleur', 'Taille', 'Modèle', 'Matière', 'Style'];

let nextId = 1;
function uid() {
  return `var-${Date.now()}-${nextId++}`;
}

function combinationKey(combo: Record<string, string>) {
  return Object.entries(combo)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, value]) => `${name.trim().toLocaleLowerCase()}:${value.trim().toLocaleLowerCase()}`)
    .join('|');
}

function combinationLabel(combo: Record<string, string>) {
  return Object.values(combo).join(' / ');
}

function variantCount(attributes: Attribute[]) {
  const valid = attributes.filter((attribute) => attribute.name.trim() && attribute.values.length);
  if (!valid.length) return 0;
  return valid.reduce((total, attribute) => total * attribute.values.length, 1);
}

function reconcileVariants(attributes: Attribute[], current: Variant[]) {
  const validAttributes = attributes.filter(
    (attribute) => attribute.name.trim() && attribute.values.length > 0
  );
  if (!validAttributes.length) return [];

  const currentByCombination = new Map(
    current.map((variant) => [combinationKey(variant.combination), variant])
  );
  const combinations = validAttributes.reduce<Record<string, string>[]>(
    (result, attribute) => {
      const name = attribute.name.trim();
      if (!result.length) {
        return attribute.values.map((value) => ({ [name]: value }));
      }
      return result.flatMap((combination) =>
        attribute.values.map((value) => ({ ...combination, [name]: value }))
      );
    },
    []
  );

  return combinations.map((combination) => {
    const existing = currentByCombination.get(combinationKey(combination));
    if (existing) return { ...existing, combination };

    const closest = current.reduce<{ variant: Variant; score: number } | null>(
      (best, variant) => {
        const score = Object.entries(combination).filter(
          ([name, value]) => variant.combination[name] === value
        ).length;
        return !best || score > best.score ? { variant, score } : best;
      },
      null
    )?.variant;
    return {
      id: uid(),
      combination,
      price: closest?.price ?? '',
      sku: '',
      stock: closest?.stock ?? '',
      enabled: closest?.enabled ?? true,
    };
  });
}

function moveItem<T>(items: T[], from: number, to: number) {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function VariantManager({
  attributes,
  variants,
  onAttributesChange,
  onVariantsChange,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkStock, setBulkStock] = useState('');
  const [notice, setNotice] = useState('');
  const lastOptionNames = useRef<Record<string, string>>(
    Object.fromEntries(attributes.map((attribute) => [attribute.id, attribute.name.trim()]))
  );

  const filteredVariants = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return variants;
    return variants.filter((variant) =>
      [combinationLabel(variant.combination), variant.sku]
        .join(' ')
        .toLocaleLowerCase()
        .includes(query)
    );
  }, [search, variants]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedVisibleCount = filteredVariants.filter((variant) =>
    selectedSet.has(variant.id)
  ).length;
  const allVisibleSelected =
    filteredVariants.length > 0 && selectedVisibleCount === filteredVariants.length;
  const enabledCount = variants.filter((variant) => variant.enabled).length;
  const outOfStockCount = variants.filter(
    (variant) => variant.enabled && variant.stock !== '' && Number(variant.stock) <= 0
  ).length;

  const commitAttributes = (nextAttributes: Attribute[], current = variants) => {
    const count = variantCount(nextAttributes);
    if (count > MAX_VARIANTS) {
      setNotice(`Maximum ${MAX_VARIANTS} variantes. Réduisez le nombre de valeurs.`);
      return false;
    }
    setNotice('');
    onAttributesChange(nextAttributes);
    const nextVariants = reconcileVariants(nextAttributes, current);
    onVariantsChange(nextVariants);
    setSelectedIds((ids) => ids.filter((id) => nextVariants.some((variant) => variant.id === id)));
    return true;
  };

  const addAttribute = () => {
    if (attributes.length >= MAX_OPTIONS) {
      setNotice(`Vous pouvez créer jusqu’à ${MAX_OPTIONS} options par produit.`);
      return;
    }
    setNotice('');
    onAttributesChange([
      ...attributes,
      { id: uid(), name: '', values: [] },
    ]);
  };

  const removeAttribute = (id: string) => {
    delete lastOptionNames.current[id];
    commitAttributes(attributes.filter((attribute) => attribute.id !== id));
  };

  const updateAttributeName = (id: string, name: string) => {
    const currentAttribute = attributes.find((attribute) => attribute.id === id);
    if (!currentAttribute) return;
    const duplicateName = attributes.some(
      (attribute) =>
        attribute.id !== id &&
        attribute.name.trim().toLocaleLowerCase() === name.trim().toLocaleLowerCase()
    );
    if (name.trim() && duplicateName) {
      setNotice('Chaque option doit avoir un nom différent.');
      return;
    }
    const previousName =
      lastOptionNames.current[id] || currentAttribute.name.trim();
    const nextAttributes = attributes.map((attribute) =>
      attribute.id === id ? { ...attribute, name } : attribute
    );
    const nextName = name.trim();
    if (!nextName) {
      setNotice('');
      onAttributesChange(nextAttributes);
      return;
    }
    const migratedVariants = variants.map((variant) => {
      if (!previousName || previousName === nextName || !(previousName in variant.combination)) {
        return variant;
      }
      const combination = { ...variant.combination };
      const value = combination[previousName];
      delete combination[previousName];
      if (nextName) combination[nextName] = value;
      return { ...variant, combination };
    });

    lastOptionNames.current[id] = nextName;
    commitAttributes(nextAttributes, migratedVariants);
  };

  const addValues = (attributeId: string, rawValue: string) => {
    const candidates = rawValue
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    if (!candidates.length) return false;

    const nextAttributes = attributes.map((attribute) => {
      if (attribute.id !== attributeId) return attribute;
      const known = new Set(attribute.values.map((value) => value.toLocaleLowerCase()));
      const additions = candidates.filter((value) => {
        const key = value.toLocaleLowerCase();
        if (known.has(key)) return false;
        known.add(key);
        return true;
      });
      return { ...attribute, values: [...attribute.values, ...additions] };
    });
    return commitAttributes(nextAttributes);
  };

  const removeValue = (attributeId: string, value: string) => {
    commitAttributes(
      attributes.map((attribute) =>
        attribute.id === attributeId
          ? { ...attribute, values: attribute.values.filter((item) => item !== value) }
          : attribute
      )
    );
  };

  const moveAttribute = (index: number, direction: -1 | 1) => {
    commitAttributes(moveItem(attributes, index, index + direction));
  };

  const moveValue = (attributeId: string, index: number, direction: -1 | 1) => {
    commitAttributes(
      attributes.map((attribute) =>
        attribute.id === attributeId
          ? { ...attribute, values: moveItem(attribute.values, index, index + direction) }
          : attribute
      )
    );
  };

  const updateVariant = (
    variantId: string,
    field: 'price' | 'sku' | 'stock',
    value: string
  ) => {
    onVariantsChange(
      variants.map((variant) =>
        variant.id === variantId ? { ...variant, [field]: value } : variant
      )
    );
  };

  const updateSelected = (patch: Partial<Pick<Variant, 'price' | 'stock' | 'enabled'>>) => {
    if (!selectedIds.length) return;
    onVariantsChange(
      variants.map((variant) =>
        selectedSet.has(variant.id) ? { ...variant, ...patch } : variant
      )
    );
  };

  const duplicateSkuPrefix = () => {
    if (!selectedIds.length) return;
    const prefix = window.prompt('Préfixe SKU (ex. PC-974)');
    if (!prefix?.trim()) return;
    let position = 1;
    onVariantsChange(
      variants.map((variant) =>
        selectedSet.has(variant.id)
          ? { ...variant, sku: `${prefix.trim().toUpperCase()}-${String(position++).padStart(2, '0')}` }
          : variant
      )
    );
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
    );
  };

  const toggleAllVisible = () => {
    setSelectedIds((ids) => {
      const visibleIds = filteredVariants.map((variant) => variant.id);
      if (allVisibleSelected) return ids.filter((id) => !visibleIds.includes(id));
      return Array.from(new Set([...ids, ...visibleIds]));
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-ink">Options du produit</h4>
            <p className="mt-1 text-xs text-gray-500">
              Exemple : Couleur avec les valeurs Bleu, Orange et Vert.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs text-gray-500 shadow-sm">
            {attributes.length}/{MAX_OPTIONS} options
          </span>
        </div>

        <div className="space-y-4">
          {attributes.map((attribute, attributeIndex) => (
            <div key={attribute.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex shrink-0 flex-col">
                  <button
                    type="button"
                    onClick={() => moveAttribute(attributeIndex, -1)}
                    disabled={attributeIndex === 0}
                    aria-label="Monter l’option"
                    className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-ink disabled:opacity-20"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveAttribute(attributeIndex, 1)}
                    disabled={attributeIndex === attributes.length - 1}
                    aria-label="Descendre l’option"
                    className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-ink disabled:opacity-20"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <label className="mb-1 block text-xs font-medium text-gray-500">Nom de l’option</label>
                  <input
                    type="text"
                    list={`option-suggestions-${attribute.id}`}
                    value={attribute.name}
                    onChange={(event) => updateAttributeName(attribute.id, event.target.value)}
                    placeholder="Couleur, Taille, Modèle…"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
                  />
                  <datalist id={`option-suggestions-${attribute.id}`}>
                    {OPTION_SUGGESTIONS.map((suggestion) => (
                      <option key={suggestion} value={suggestion} />
                    ))}
                  </datalist>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttribute(attribute.id)}
                  aria-label="Supprimer l’option"
                  className="mt-5 rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={17} />
                </button>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-xs font-medium text-gray-500">Valeurs</label>
                <div className="flex flex-wrap gap-2">
                  {attribute.values.map((value, valueIndex) => (
                    <span
                      key={value}
                      className="inline-flex items-center overflow-hidden rounded-lg border border-jungle-100 bg-jungle-50 text-sm text-ink"
                    >
                      <button
                        type="button"
                        onClick={() => moveValue(attribute.id, valueIndex, -1)}
                        disabled={valueIndex === 0}
                        aria-label={`Déplacer ${value} vers la gauche`}
                        className="px-1.5 py-1.5 text-jungle-500 hover:bg-jungle-100 disabled:opacity-20"
                      >
                        <ChevronUp className="-rotate-90" size={13} />
                      </button>
                      <span className="px-1 py-1.5 font-medium">{value}</span>
                      <button
                        type="button"
                        onClick={() => moveValue(attribute.id, valueIndex, 1)}
                        disabled={valueIndex === attribute.values.length - 1}
                        aria-label={`Déplacer ${value} vers la droite`}
                        className="px-1.5 py-1.5 text-jungle-500 hover:bg-jungle-100 disabled:opacity-20"
                      >
                        <ChevronDown className="-rotate-90" size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeValue(attribute.id, value)}
                        aria-label={`Supprimer ${value}`}
                        className="border-l border-jungle-100 px-2 py-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ajouter une valeur (virgule ou Entrée)"
                    className="min-w-0 flex-1 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ',') return;
                      event.preventDefault();
                      if (addValues(attribute.id, event.currentTarget.value)) {
                        event.currentTarget.value = '';
                      }
                    }}
                    onBlur={(event) => {
                      if (addValues(attribute.id, event.currentTarget.value)) {
                        event.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addAttribute}
          disabled={attributes.length >= MAX_OPTIONS}
          className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-jungle-700 transition-colors hover:bg-jungle-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={16} />
          Ajouter une option
        </button>

        {notice && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            {notice}
          </p>
        )}
      </div>

      {variants.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="border-b border-gray-200 bg-white px-4 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold text-ink">
                    {variants.length} variante{variants.length > 1 ? 's' : ''}
                  </h4>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {enabledCount} active{enabledCount > 1 ? 's' : ''}
                  </span>
                  {outOfStockCount > 0 && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                      {outOfStockCount} sans stock
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Les informations déjà saisies sont conservées lorsque vous ajoutez une valeur.
                </p>
              </div>
              <label className="relative block w-full lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher variante ou SKU"
                  className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
                />
              </label>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <div className="border-b border-jungle-100 bg-jungle-50 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-sm font-semibold text-jungle-800">
                  {selectedIds.length} sélectionnée{selectedIds.length > 1 ? 's' : ''}
                </span>
                <div className="flex items-center overflow-hidden rounded-lg border border-jungle-200 bg-white">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={bulkPrice}
                    onChange={(event) => setBulkPrice(event.target.value)}
                    placeholder="Prix"
                    className="w-20 px-2.5 py-1.5 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => updateSelected({ price: bulkPrice })}
                    disabled={bulkPrice === ''}
                    className="border-l border-jungle-100 px-2.5 py-1.5 text-xs font-medium text-jungle-700 hover:bg-jungle-50 disabled:opacity-40"
                  >
                    Appliquer
                  </button>
                </div>
                <div className="flex items-center overflow-hidden rounded-lg border border-jungle-200 bg-white">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={bulkStock}
                    onChange={(event) => setBulkStock(event.target.value)}
                    placeholder="Stock"
                    className="w-20 px-2.5 py-1.5 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => updateSelected({ stock: bulkStock })}
                    disabled={bulkStock === ''}
                    className="border-l border-jungle-100 px-2.5 py-1.5 text-xs font-medium text-jungle-700 hover:bg-jungle-50 disabled:opacity-40"
                  >
                    Appliquer
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => updateSelected({ enabled: true })}
                  className="rounded-lg border border-jungle-200 bg-white px-3 py-1.5 text-xs font-medium text-jungle-700 hover:bg-jungle-100"
                >
                  Activer
                </button>
                <button
                  type="button"
                  onClick={() => updateSelected({ enabled: false })}
                  className="rounded-lg border border-jungle-200 bg-white px-3 py-1.5 text-xs font-medium text-jungle-700 hover:bg-jungle-100"
                >
                  Désactiver
                </button>
                <button
                  type="button"
                  onClick={duplicateSkuPrefix}
                  className="flex items-center gap-1.5 rounded-lg border border-jungle-200 bg-white px-3 py-1.5 text-xs font-medium text-jungle-700 hover:bg-jungle-100"
                >
                  <Copy size={13} /> Générer les SKU
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="ml-auto rounded p-1.5 text-jungle-600 hover:bg-jungle-100"
                  aria-label="Annuler la sélection"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-400">
                  <th className="w-12 px-4 py-3 font-medium">
                    <button
                      type="button"
                      onClick={toggleAllVisible}
                      aria-label={allVisibleSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded border',
                        allVisibleSelected
                          ? 'border-jungle-600 bg-jungle-600 text-white'
                          : 'border-gray-300 bg-white text-transparent'
                      )}
                    >
                      <Check size={13} />
                    </button>
                  </th>
                  <th className="px-3 py-3 font-medium">Variante</th>
                  <th className="px-3 py-3 font-medium">Prix</th>
                  <th className="px-3 py-3 font-medium">Stock</th>
                  <th className="px-3 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 text-right font-medium">État</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredVariants.map((variant) => {
                  const isSelected = selectedSet.has(variant.id);
                  return (
                    <tr
                      key={variant.id}
                      className={cn(
                        'transition-colors hover:bg-gray-50/70',
                        isSelected && 'bg-jungle-50/60',
                        !variant.enabled && 'text-gray-400'
                      )}
                    >
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleSelected(variant.id)}
                          aria-label={`Sélectionner ${combinationLabel(variant.combination)}`}
                          className={cn(
                            'flex h-5 w-5 items-center justify-center rounded border',
                            isSelected
                              ? 'border-jungle-600 bg-jungle-600 text-white'
                              : 'border-gray-300 bg-white text-transparent'
                          )}
                        >
                          <Check size={13} />
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(variant.combination).map(([name, value]) => (
                            <span
                              key={`${name}-${value}`}
                              title={name}
                              className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-ink"
                            >
                              {value}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="relative w-24">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variant.price}
                            onChange={(event) => updateVariant(variant.id, 'price', event.target.value)}
                            placeholder="Défaut"
                            className="w-full rounded-lg border border-gray-200 py-2 pl-2.5 pr-6 text-sm focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
                          />
                          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={variant.stock}
                          onChange={(event) => updateVariant(variant.id, 'stock', event.target.value)}
                          placeholder="Illimité"
                          className="w-24 rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(event) => updateVariant(variant.id, 'sku', event.target.value)}
                          placeholder="SKU"
                          className="w-32 rounded-lg border border-gray-200 px-2.5 py-2 font-mono text-xs focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={variant.enabled}
                          onClick={() =>
                            onVariantsChange(
                              variants.map((item) =>
                                item.id === variant.id ? { ...item, enabled: !item.enabled } : item
                              )
                            )
                          }
                          className={cn(
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                            variant.enabled ? 'bg-jungle-600' : 'bg-gray-200'
                          )}
                        >
                          <span
                            className={cn(
                              'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                              variant.enabled ? 'translate-x-6' : 'translate-x-1'
                            )}
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredVariants.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-gray-400">
              Aucune variante ne correspond à votre recherche.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
