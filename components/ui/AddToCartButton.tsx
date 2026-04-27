'use client';

import { useState } from 'react';
import { ShoppingBag, Check, Minus, Plus } from 'lucide-react';
import { useCart } from '@/lib/cart/CartProvider';
import type { CartItem } from '@/lib/cart/types';

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    salePrice?: number | null;
    image?: string;
    inStock: boolean;
  };
  variantId?: string;
  variantLabel?: string;
  disabled?: boolean;
};

export function AddToCartButton({ product, variantId, variantLabel, disabled }: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const price = product.salePrice || product.price;

  const handleAdd = () => {
    const item: CartItem = {
      productId: product.id,
      variantId,
      slug: product.slug,
      name: product.name,
      variantLabel,
      price,
      quantity,
      image: product.image,
    };

    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    setQuantity(1);
  };

  if (!product.inStock) {
    return (
      <button
        disabled
        className="w-full py-3 bg-gray-200 text-gray-500 text-sm font-bold uppercase tracking-wider rounded-xl cursor-not-allowed"
      >
        Rupture de stock
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quantité */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Quantité</span>
        <div className="flex items-center border border-gray-200 rounded-lg">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-2 hover:bg-gray-50 transition-colors"
          >
            <Minus size={14} className="text-gray-500" />
          </button>
          <span className="px-4 text-sm font-medium text-ink min-w-[40px] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="p-2 hover:bg-gray-50 transition-colors"
          >
            <Plus size={14} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Bouton */}
      <button
        onClick={handleAdd}
        disabled={disabled}
        className={`w-full py-3 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all duration-300 ${
          disabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : added
              ? 'bg-jungle-500 text-white'
              : 'bg-jungle-700 hover:bg-jungle-800 text-cream'
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
            Ajouter au panier — {(price * quantity).toFixed(2)} €
          </>
        )}
      </button>
    </div>
  );
}
