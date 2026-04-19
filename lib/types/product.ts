// Types produit — basés sur l'export CSV WooCommerce standard
// Schéma WooCommerce : https://woocommerce.com/document/product-csv-importer-exporter/

export type ProductCategory =
  | 'magnets'
  | 'stickers'
  | 'textile'
  | 'goodies'
  | 'decoration'
  | 'uncategorized';

export type ProductStatus = 'publish' | 'draft' | 'private';

export type ProductImage = {
  src: string;           // URL source (WC ou locale)
  localPath?: string;    // chemin local relatif après téléchargement (ex: "products/magnets/magnet-974.jpg")
  alt?: string;
  position: number;      // 0 = image principale, 1+ = galerie
};

export type Product = {
  // Identité
  id: string;            // slug unique (kebab-case)
  sku?: string;
  name: string;
  description?: string;
  shortDescription?: string;

  // Classification
  category: ProductCategory;
  tags: string[];

  // Prix
  price: number;
  regularPrice?: number;
  salePrice?: number;
  currency: string;      // "EUR"

  // Stock
  inStock: boolean;
  stockQuantity?: number;
  manageStock: boolean;

  // Images
  images: ProductImage[];

  // Attributs (taille, couleur, etc.)
  attributes?: Record<string, string[]>;

  // Méta SEO
  status: ProductStatus;
  featured: boolean;

  // Dates
  createdAt?: string;
  updatedAt?: string;

  // Origine / traçabilité
  woocommerceId?: number;  // ID WC d'origine si importé
};

// Helper : slug depuis un nom de produit
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')       // supprime accents
    .replace(/[^a-z0-9]+/g, '-')           // non-alphanumériques → tiret
    .replace(/^-+|-+$/g, '')               // trim tirets
    .replace(/-+/g, '-');                  // tirets multiples → simple
}
