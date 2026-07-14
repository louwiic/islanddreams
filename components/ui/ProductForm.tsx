'use client';

import { useState } from 'react';
import { Check, Gift, ShoppingBag } from 'lucide-react';
import { AddToCartButton } from './AddToCartButton';
import { useCart } from '@/lib/cart/CartProvider';
import type { CartItem } from '@/lib/cart/types';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

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
  const [showGiftRequest, setShowGiftRequest] = useState(false);
  const [requestName, setRequestName] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestStatus, setRequestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [added, setAdded] = useState(false);

  const expiresAt = defaultExpiryDate();
  const selectedAmount = amount === 'custom'
    ? Number(customAmount.replace(',', '.'))
    : Number(amount);
  const validAmount = Number.isFinite(selectedAmount) && selectedAmount >= 10 && selectedAmount <= 500;
  const canAdd = validAmount;

  const handleAdd = () => {
    if (!canAdd) return;

    const roundedAmount = Math.round(selectedAmount * 100) / 100;
    const labelParts = [
      `Bon d'achat ${roundedAmount.toFixed(2)} €`,
      `valable 1 an`,
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
        isGift: false,
        expiresAt,
      },
    };

    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleGiftRequest = async () => {
    if (!requestName.trim() || !requestEmail.trim() || !validAmount) return;
    setRequestStatus('sending');
    try {
      const roundedAmount = Math.round(selectedAmount * 100) / 100;
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: requestName.trim(),
          email: requestEmail.trim(),
          objet: "Demande bon d'achat à offrir",
          message: [
            `Le client souhaite offrir un bon d'achat de ${roundedAmount.toFixed(2)} €.`,
            '',
            requestMessage.trim() ? `Message client : ${requestMessage.trim()}` : null,
            '',
            'Merci de le recontacter pour personnaliser le bon cadeau.',
          ].filter(Boolean).join('\n'),
        }),
      });
      if (!res.ok) throw new Error('request failed');
      setRequestStatus('sent');
      setRequestMessage('');
    } catch {
      setRequestStatus('error');
    }
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
            Choisissez le montant, puis un code unique valable 1 an sera généré après paiement.
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

      <div className="rounded-xl border border-gray-200 bg-white p-3">
        <button
          type="button"
          onClick={() => setShowGiftRequest((value) => !value)}
          className="w-full text-left text-sm font-bold text-jungle-800 hover:text-jungle-900"
        >
          Je souhaite offrir ce bon d&apos;achat
        </button>
        <p className="mt-1 text-xs leading-relaxed text-ink/55">
          Pour un bon cadeau personnalisé, envoyez une demande. Nous vous recontacterons.
        </p>

        {showGiftRequest && (
          <div className="mt-3 space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="text"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                placeholder="Votre nom"
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
              />
              <input
                type="email"
                value={requestEmail}
                onChange={(e) => setRequestEmail(e.target.value)}
                placeholder="Votre email"
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
              />
            </div>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Message ou précision pour le bon cadeau"
              rows={3}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
            />
            <button
              type="button"
              onClick={handleGiftRequest}
              disabled={
                requestStatus === 'sending' ||
                !requestName.trim() ||
                !requestEmail.trim() ||
                !validAmount
              }
              className="w-full rounded-xl bg-jungle-800 px-4 py-2 text-sm font-bold uppercase tracking-wider text-cream transition-colors hover:bg-jungle-900 disabled:opacity-40"
            >
              {requestStatus === 'sending' ? 'Envoi...' : 'Envoyer ma demande'}
            </button>
            {requestStatus === 'sent' && (
              <p className="text-xs font-semibold text-jungle-700">
                Demande envoyée. Nous vous recontacterons rapidement.
              </p>
            )}
            {requestStatus === 'error' && (
              <p className="text-xs font-semibold text-coral-500">
                Impossible d&apos;envoyer la demande pour le moment.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductForm({ product, attributes, variants }: Props) {
  const { t } = useLanguage();
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
          {t('product.select', { attributes: attributes.map((a) => a.name.toLowerCase()).join(' / ') })}
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
