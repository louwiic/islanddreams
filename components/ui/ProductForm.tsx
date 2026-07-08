'use client';

import { useState } from 'react';
import { Check, Gift, ShoppingBag } from 'lucide-react';
import { AddToCartButton } from './AddToCartButton';
import { useCart } from '@/lib/cart/CartProvider';
import type { CartItem } from '@/lib/cart/types';

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
    weight_grams?: number | null;
    manage_stock?: boolean | null;
    stock_quantity?: number | null;
  };
  attributes: Attribute[];
  variants: Variant[];
};

function combinationKey(combo: Record<string, string>) {
  return JSON.stringify(Object.fromEntries(Object.entries(combo).sort()));
}

function defaultExpiryDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
}

function isVoucherProduct(slug: string) {
  return ['bon-d-achat', 'bon-achat', 'carte-cadeau'].includes(slug);
}

function GiftVoucherForm({ product }: { product: Props['product'] }) {
  const { addItem } = useCart();
  const [amount, setAmount] = useState('25');
  const [customAmount, setCustomAmount] = useState('');
  const [isGift, setIsGift] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState(defaultExpiryDate());
  const [added, setAdded] = useState(false);

  const selectedAmount = amount === 'custom'
    ? Number(customAmount.replace(',', '.'))
    : Number(amount);
  const validAmount = Number.isFinite(selectedAmount) && selectedAmount >= 10 && selectedAmount <= 500;
  const validExpiry = /^\d{4}-\d{2}-\d{2}$/.test(expiresAt);
  const canAdd = validAmount && validExpiry;

  const handleAdd = () => {
    if (!canAdd) return;

    const roundedAmount = Math.round(selectedAmount * 100) / 100;
    const labelParts = [
      `Bon d'achat ${roundedAmount.toFixed(2)} €`,
      isGift ? 'à offrir' : null,
      expiresAt ? `valable jusqu'au ${new Date(`${expiresAt}T12:00:00`).toLocaleDateString('fr-FR')}` : null,
    ].filter(Boolean);

    const item: CartItem = {
      productId: product.id,
      variantId: `voucher-${roundedAmount}-${expiresAt}-${Date.now()}`,
      slug: product.slug,
      name: product.name,
      variantLabel: labelParts.join(' — '),
      price: roundedAmount,
      quantity: 1,
      image: product.image,
      weightGrams: 0,
      maxQuantity: 1,
      voucher: {
        amount: roundedAmount,
        isGift,
        recipientName: recipientName.trim() || undefined,
        recipientEmail: recipientEmail.trim() || undefined,
        expiresAt,
      },
    };

    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-5 rounded-2xl border border-sun-200 bg-sun-50/60 p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-jungle-800 text-cream">
          <Gift size={20} />
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.12em] text-ink">
            Bon d&apos;achat numérique
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink/65">
            Choisissez le montant, ajoutez une date limite, puis un code unique sera généré après paiement.
          </p>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-ink">Montant</label>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {['25', '50', '75', '100'].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setAmount(value)}
              className={`rounded-xl border px-3 py-2 text-sm font-bold transition-colors ${
                amount === value
                  ? 'border-jungle-700 bg-jungle-700 text-cream'
                  : 'border-gray-200 bg-white text-ink hover:border-jungle-300'
              }`}
            >
              {value} €
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setAmount('custom')}
            className={`rounded-xl border px-3 py-2 text-sm font-bold transition-colors ${
              amount === 'custom'
                ? 'border-jungle-700 bg-jungle-700 text-cream'
                : 'border-gray-200 bg-white text-ink hover:border-jungle-300'
            }`}
          >
            Autre
          </button>
          <input
            type="number"
            min="10"
            max="500"
            step="1"
            value={customAmount}
            onFocus={() => setAmount('custom')}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Montant libre"
            className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
          />
        </div>
        {!validAmount && (
          <p className="mt-1 text-xs text-coral-500">Montant autorisé : 10 € à 500 €.</p>
        )}
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-semibold text-ink">
        <input
          type="checkbox"
          checked={isGift}
          onChange={(e) => setIsGift(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-jungle-700 focus:ring-jungle-500"
        />
        Offrir ce bon d&apos;achat
      </label>

      {isGift && (
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Nom du destinataire"
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
          />
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="Email du destinataire (optionnel)"
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
          />
        </div>
      )}

      <div>
        <label className="text-sm font-semibold text-ink">Date limite d&apos;usage</label>
        <input
          type="date"
          value={expiresAt}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
        />
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!canAdd}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold uppercase tracking-wider transition-all ${
          !canAdd
            ? 'bg-gray-200 text-gray-400'
            : added
              ? 'bg-jungle-500 text-white'
              : 'bg-jungle-700 text-cream hover:bg-jungle-800'
        }`}
      >
        {added ? (
          <>
            <Check size={18} />
            Ajouté au panier
          </>
        ) : (
          <>
            <ShoppingBag size={18} />
            Ajouter — {validAmount ? selectedAmount.toFixed(2) : '0.00'} €
          </>
        )}
      </button>
    </div>
  );
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

  if (isVoucherProduct(product.slug)) {
    return <GiftVoucherForm product={product} />;
  }

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
          salePrice: null,
          image: product.image,
          inStock,
          weightGrams: product.weight_grams,
          manageStock: product.manage_stock ?? false,
          stockQuantity: product.stock_quantity,
        }}
        variantId={selectedVariant?.id}
        variantLabel={variantLabel}
        disabled={hasVariants && !allSelected}
      />
    </div>
  );
}
