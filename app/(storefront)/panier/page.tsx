'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  Truck,
  MapPin,
} from 'lucide-react';
import { useCart } from '@/lib/cart/CartProvider';
import { cn } from '@/lib/utils';

type ShippingMethod = {
  id: string;
  name: string;
  cost: number;
  requiresSignature: boolean;
};

type ShippingResult = {
  zone: string;
  methods: ShippingMethod[];
};

export default function PanierPage() {
  const { items, total, count, removeItem, updateQuantity, clearCart } = useCart();
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('RE');
  const [shipping, setShipping] = useState<ShippingResult | null>(null);
  const [shippingError, setShippingError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const shippingCost =
    shipping?.methods.find((m) => m.id === selectedMethod)?.cost ?? 0;
  const grandTotal = total + shippingCost;

  const calculateShipping = async () => {
    if (!postalCode.trim()) return;
    setLoadingShipping(true);
    setShippingError('');
    setShipping(null);
    setSelectedMethod(null);

    try {
      const res = await fetch(
        `/api/shipping?country=${country}&postal_code=${postalCode.trim()}`
      );
      const data = await res.json();

      if (!res.ok) {
        setShippingError(
          data.error || 'Zone non couverte. Contactez-nous.'
        );
      } else {
        setShipping(data);
        if (data.methods.length === 1) {
          setSelectedMethod(data.methods[0].id);
        }
      }
    } catch {
      setShippingError('Erreur de connexion');
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shippingMethodId: selectedMethod }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Erreur lors de la création du paiement');
        setCheckingOut(false);
      }
    } catch {
      alert('Erreur de connexion');
      setCheckingOut(false);
    }
  };

  if (count === 0) {
    return (
      <main className="pt-28 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} className="text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold text-ink">Votre panier est vide</h1>
          <p className="mt-3 text-gray-500">
            Découvrez nos souvenirs de La Réunion
          </p>
          <Link
            href="/boutique"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-jungle-700 text-cream text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-jungle-800 transition-colors"
          >
            <ShoppingBag size={16} />
            Voir la boutique
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/boutique"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-ink">
            Panier ({count} article{count > 1 ? 's' : ''})
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Articles */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const key = item.variantId
                ? `${item.productId}:${item.variantId}`
                : item.productId;

              return (
                <div
                  key={key}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4"
                >
                  <Link
                    href={`/boutique/${item.slug}`}
                    className="shrink-0 w-24 h-24 rounded-lg bg-gray-50 relative overflow-hidden"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag size={24} />
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/boutique/${item.slug}`}
                      className="text-sm font-semibold text-ink hover:text-jungle-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                    {item.variantLabel && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.variantLabel}
                      </p>
                    )}
                    <p className="text-base font-bold text-jungle-700 mt-2">
                      {item.price.toFixed(2)} €
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1,
                              item.variantId
                            )
                          }
                          className="p-2 hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={14} className="text-gray-500" />
                        </button>
                        <span className="px-3 text-sm font-medium text-ink min-w-[32px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity + 1,
                              item.variantId
                            )
                          }
                          className="p-2 hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={14} className="text-gray-500" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-ink">
                          {(item.price * item.quantity).toFixed(2)} €
                        </span>
                        <button
                          onClick={() =>
                            removeItem(item.productId, item.variantId)
                          }
                          className="p-1.5 rounded-lg text-gray-300 hover:text-coral-500 hover:bg-coral-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Résumé + Livraison */}
          <div className="space-y-4">
            {/* Calcul livraison */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Truck size={16} className="text-gray-500" />
                <h3 className="font-semibold text-ink text-sm">Livraison</h3>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setShipping(null);
                    }}
                    className="px-2 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-jungle-500/30"
                  >
                    <option value="RE">La Réunion</option>
                    <option value="FR">France</option>
                  </select>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && calculateShipping()}
                    placeholder="Code postal"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500/30"
                  />
                  <button
                    onClick={calculateShipping}
                    disabled={loadingShipping || !postalCode.trim()}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-40"
                  >
                    {loadingShipping ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      'OK'
                    )}
                  </button>
                </div>

                {shippingError && (
                  <p className="text-xs text-coral-500">{shippingError}</p>
                )}

                {shipping && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={12} />
                      {shipping.zone}
                    </p>
                    {shipping.methods.map((method) => (
                      <label
                        key={method.id}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors',
                          selectedMethod === method.id
                            ? 'border-jungle-500 bg-jungle-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            value={method.id}
                            checked={selectedMethod === method.id}
                            onChange={() => setSelectedMethod(method.id)}
                            className="text-jungle-600 focus:ring-jungle-500"
                          />
                          <div>
                            <p className="text-sm font-medium text-ink">
                              {method.name}
                            </p>
                            {method.requiresSignature && (
                              <p className="text-[10px] text-ocean-600">
                                Avec signature
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-bold text-ink">
                          {method.cost.toFixed(2)} €
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {!shipping && !shippingError && (
                  <p className="text-xs text-gray-400">
                    Entrez votre code postal pour calculer les frais
                  </p>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Sous-total</span>
                <span>{total.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Livraison</span>
                <span>
                  {shipping
                    ? selectedMethod
                      ? `${shippingCost.toFixed(2)} €`
                      : 'Sélectionnez'
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-ink pt-3 border-t border-gray-100">
                <span>Total</span>
                <span>{grandTotal.toFixed(2)} €</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut || !selectedMethod}
                className="w-full py-3 bg-jungle-700 hover:bg-jungle-800 text-cream text-sm font-bold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
              >
                {checkingOut ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Redirection...
                  </>
                ) : (
                  `Commander — ${grandTotal.toFixed(2)} €`
                )}
              </button>

              {!selectedMethod && shipping && (
                <p className="text-xs text-coral-500 text-center">
                  Choisissez un mode de livraison
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
