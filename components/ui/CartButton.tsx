'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart/CartProvider';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function CartButton() {
  const { count, toggleCart } = useCart();
  const { t } = useLanguage();

  return (
    <button
      onClick={toggleCart}
      className="relative p-2 text-cream/90 hover:text-sun-400 transition-colors"
      aria-label={t('cart.label', { count })}
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
