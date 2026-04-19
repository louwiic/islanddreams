'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '@/lib/cart/CartProvider';
import { cn } from '@/lib/utils';

export function CartDrawer() {
  const { items, total, count, isOpen, closeCart, removeItem, updateQuantity } =
    useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
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

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          'fixed top-0 right-0 z-[70] h-full w-full sm:w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-ink" />
            <h2 className="font-semibold text-ink">
              Panier
              {count > 0 && (
                <span className="ml-1.5 text-sm text-gray-400 font-normal">
                  ({count})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Contenu */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingBag size={28} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">Votre panier est vide</p>
            <button
              onClick={closeCart}
              className="px-5 py-2 bg-jungle-600 text-white text-sm font-medium rounded-lg hover:bg-jungle-700 transition-colors"
            >
              Continuer mes achats
            </button>
          </div>
        ) : (
          <>
            {/* Liste articles */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((item) => {
                const key = item.variantId
                  ? `${item.productId}:${item.variantId}`
                  : item.productId;

                return (
                  <div key={key} className="flex gap-3">
                    {/* Image */}
                    <Link
                      href={`/boutique/${item.slug}`}
                      onClick={closeCart}
                      className="shrink-0 w-20 h-20 rounded-lg bg-gray-50 relative overflow-hidden"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-2"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag size={20} />
                        </div>
                      )}
                    </Link>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/boutique/${item.slug}`}
                        onClick={closeCart}
                        className="text-sm font-medium text-ink hover:text-jungle-600 transition-colors line-clamp-2 leading-tight"
                      >
                        {item.name}
                      </Link>
                      {item.variantLabel && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.variantLabel}
                        </p>
                      )}
                      <p className="text-sm font-bold text-jungle-700 mt-1">
                        {item.price.toFixed(2)} €
                      </p>

                      {/* Quantité */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity - 1,
                                item.variantId
                              )
                            }
                            className="p-1.5 hover:bg-gray-50 transition-colors"
                          >
                            <Minus size={12} className="text-gray-500" />
                          </button>
                          <span className="px-2.5 text-sm font-medium text-ink min-w-[28px] text-center">
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
                            className="p-1.5 hover:bg-gray-50 transition-colors"
                          >
                            <Plus size={12} className="text-gray-500" />
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            removeItem(item.productId, item.variantId)
                          }
                          className="p-1.5 rounded-lg text-gray-300 hover:text-coral-500 hover:bg-coral-50 transition-colors ml-auto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Sous-total</span>
                <span className="text-lg font-bold text-ink">
                  {total.toFixed(2)} €
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Frais de livraison calculés au checkout
              </p>
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full py-3 bg-jungle-700 hover:bg-jungle-800 text-cream text-sm font-bold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {checkingOut ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Redirection...
                  </>
                ) : (
                  `Commander — ${total.toFixed(2)} €`
                )}
              </button>
              <Link
                href="/panier"
                onClick={closeCart}
                className="block w-full py-2 text-sm text-jungle-600 hover:text-jungle-700 transition-colors text-center font-medium"
              >
                Voir le panier complet
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
