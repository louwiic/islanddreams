'use client';

import { useState } from 'react';
import { AddToCartButton } from './AddToCartButton';

type Variant = {
  id: string;
  combination: Record<string, string>;
  price: number | null;
  stock_quantity: number | null;
  enabled: boolean | null;
};

type Attribute = {
  id: string;
  name: string;
  values: string[];
};

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    sale_price: number | null;
    in_stock: boolean | null;
    image?: string;
  };
  attributes: Attribute[];
  variants: Variant[];
};

function combinationKey(combo: Record<string, string>) {
  return JSON.stringify(Object.fromEntries(Object.entries(combo).sort()));
}

export function ProductForm({ product, attributes, variants }: Props) {
  const [selected, setSelected] = useState<Record<string, string>>({});

  const hasVariants = attributes.length > 0 && variants.length > 0;

  // Trouver la variante sélectionnée
  const selectedVariant = hasVariants
    ? variants.find(
        (v) => combinationKey(v.combination as Record<string, string>) === combinationKey(selected),
      )
    : null;

  // Prix effectif : variante > promo > base
  const effectivePrice = selectedVariant?.price ?? product.sale_price ?? product.price;

  // Tous les attributs ont-ils une valeur sélectionnée ?
  const allSelected = hasVariants
    ? attributes.every((a) => selected[a.name] !== undefined)
    : true;

  // La variante trouvée est-elle dispo ?
  const variantInStock = selectedVariant
    ? (selectedVariant.enabled !== false) &&
      (selectedVariant.stock_quantity === null || selectedVariant.stock_quantity > 0)
    : null;

  const inStock = hasVariants
    ? allSelected
      ? (variantInStock ?? false)
      : (product.in_stock ?? true)
    : (product.in_stock ?? true);

  const selectValue = (attrName: string, value: string) => {
    setSelected((prev) => ({ ...prev, [attrName]: value }));
  };

  // Libellé variante pour le panier
  const variantLabel = selectedVariant
    ? Object.values(selected).join(' / ')
    : undefined;

  return (
    <div>
      {/* Sélecteurs d'attributs */}
      {hasVariants && (
        <div className="space-y-5 mb-6">
          {attributes.map((attr) => (
            <div key={attr.id}>
              <p className="text-sm font-medium text-ink mb-2">
                {attr.name}
                {selected[attr.name] && (
                  <span className="ml-2 font-normal text-ink/50">{selected[attr.name]}</span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {attr.values.map((val) => {
                  const isActive = selected[attr.name] === val;
                  // Vérifier si cette valeur est dispo avec les autres sélections courantes
                  const testCombo = { ...selected, [attr.name]: val };
                  const matchingVariant = variants.find(
                    (v) =>
                      Object.entries(testCombo).every(
                        ([k, vv]) => (v.combination as Record<string, string>)[k] === vv,
                      ),
                  );
                  const available =
                    Object.keys(testCombo).length < attributes.length || // pas encore complet
                    (matchingVariant
                      ? (matchingVariant.enabled !== false) &&
                        (matchingVariant.stock_quantity === null ||
                          matchingVariant.stock_quantity > 0)
                      : false);

                  return (
                    <button
                      key={val}
                      onClick={() => selectValue(attr.name, val)}
                      disabled={!available}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-all duration-150 ${
                        isActive
                          ? 'border-jungle-600 bg-jungle-600 text-cream font-medium'
                          : available
                            ? 'border-gray-200 text-ink hover:border-jungle-400'
                            : 'border-gray-100 text-gray-300 cursor-not-allowed line-through'
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sélection incomplète */}
      {hasVariants && !allSelected && (
        <p className="text-sm text-ink/50 mb-4">
          Sélectionnez {attributes.map((a) => a.name.toLowerCase()).join(' et ')} pour continuer.
        </p>
      )}

      <AddToCartButton
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: effectivePrice,
          salePrice: null, // déjà calculé dans effectivePrice
          image: product.image,
          inStock,
        }}
        variantId={selectedVariant?.id}
        variantLabel={variantLabel}
        disabled={hasVariants && !allSelected}
      />
    </div>
  );
}
