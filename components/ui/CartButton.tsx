'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart/CartProvider';

export function CartButton() {
  const { count, toggleCart } = useCart();

  return (
    <button
      onClick={toggleCart}
      className="relative p-2 text-cream/90 hover:text-sun-400 transition-colors"
      aria-label={`Panier (${count} article${count > 1 ? 's' : ''})`}
    >
      <ShoppingBag size={20} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-coral-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
