'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { CartItem, Cart } from './types';

/* ── Actions ─────────────────────────────────────────────── */

type Action =
  | { type: 'ADD'; item: CartItem }
  | { type: 'REMOVE'; productId: string; variantId?: string }
  | { type: 'UPDATE_QTY'; productId: string; variantId?: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; items: CartItem[] };

function itemKey(productId: string, variantId?: string) {
  return variantId ? `${productId}:${variantId}` : productId;
}

function computeCart(items: CartItem[]): Cart {
  return {
    items,
    total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    count: items.reduce((sum, i) => sum + i.quantity, 0),
  };
}

function reducer(state: Cart, action: Action): Cart {
  switch (action.type) {
    case 'ADD': {
      const key = itemKey(action.item.productId, action.item.variantId);
      const existing = state.items.findIndex(
        (i) => itemKey(i.productId, i.variantId) === key
      );

      if (existing >= 0) {
        const updated = [...state.items];
        updated[existing] = {
          ...updated[existing],
          quantity: updated[existing].quantity + action.item.quantity,
        };
        return computeCart(updated);
      }

      return computeCart([...state.items, action.item]);
    }

    case 'REMOVE': {
      const key = itemKey(action.productId, action.variantId);
      return computeCart(
        state.items.filter((i) => itemKey(i.productId, i.variantId) !== key)
      );
    }

    case 'UPDATE_QTY': {
      const key = itemKey(action.productId, action.variantId);
      if (action.quantity <= 0) {
        return computeCart(
          state.items.filter((i) => itemKey(i.productId, i.variantId) !== key)
        );
      }
      return computeCart(
        state.items.map((i) =>
          itemKey(i.productId, i.variantId) === key
            ? { ...i, quantity: action.quantity }
            : i
        )
      );
    }

    case 'CLEAR':
      return computeCart([]);

    case 'HYDRATE':
      return computeCart(action.items);

    default:
      return state;
  }
}

/* ── Context ─────────────────────────────────────────────── */

type CartContextType = Cart & {
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'island-dreams-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(reducer, computeCart([]));
  const [isOpen, setIsOpen] = useReducer((_: boolean, v: boolean) => v, false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as CartItem[];
        if (Array.isArray(items) && items.length > 0) {
          dispatch({ type: 'HYDRATE', items });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart.items));
    } catch {
      // ignore
    }
  }, [cart.items]);

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: 'ADD', item });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback(
    (productId: string, variantId?: string) => {
      dispatch({ type: 'REMOVE', productId, variantId });
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string) => {
      dispatch({ type: 'UPDATE_QTY', productId, variantId, quantity });
    },
    []
  );

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  return (
    <CartContext.Provider
      value={{
        ...cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        toggleCart: () => setIsOpen(!isOpen),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
