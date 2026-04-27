'use client';

import { useEffect } from 'react';
import { useCart } from '@/lib/cart/CartProvider';

// Doit correspondre à la clé utilisée dans CartProvider
const STORAGE_KEY = 'island-dreams-cart';

export function CartClearer() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Vider localStorage en premier pour bloquer la ré-hydratation du CartProvider
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    // Vider aussi l'état en mémoire
    clearCart();
  }, [clearCart]);

  return null;
}
