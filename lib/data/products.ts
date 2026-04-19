// Catalogue produits Island Dreams
// Généré automatiquement par `npm run import:products` depuis un export CSV WooCommerce.
// Ne pas éditer manuellement — relancer le script après chaque modif produit.

import type { Product } from '@/lib/types/product';

export const products: Product[] = [];

// Helpers d'accès

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(
  category: Product['category'],
): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured && p.status === 'publish');
}

export function getInStockProducts(): Product[] {
  return products.filter((p) => p.inStock && p.status === 'publish');
}
