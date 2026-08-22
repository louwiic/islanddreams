'use client';

import { createContext, useContext, useMemo, useState } from 'react';

type ProductVariantImageContextValue = {
  activeImageId: string | null;
  setActiveImageId: (imageId: string | null) => void;
};

const ProductVariantImageContext = createContext<ProductVariantImageContextValue | null>(null);

export function ProductVariantImageProvider({ children }: { children: React.ReactNode }) {
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const value = useMemo(() => ({ activeImageId, setActiveImageId }), [activeImageId]);

  return (
    <ProductVariantImageContext.Provider value={value}>
      {children}
    </ProductVariantImageContext.Provider>
  );
}

export function useProductVariantImage() {
  return useContext(ProductVariantImageContext);
}

