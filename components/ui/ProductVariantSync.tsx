'use client';

import { useState } from 'react';
import { ProductGallery } from './ProductGallery';
import { ProductForm } from './ProductForm';

type GalleryImage = {
  id: string;
  url: string;
  alt: string | null;
  is_main: boolean | null;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  sale_price: number | null;
  in_stock: boolean | null;
  image?: string;
  weight_grams?: number | null;
  manage_stock?: boolean | null;
  stock_quantity?: number | null;
};

type Attribute = {
  id: string;
  name: string;
  values: string[];
};

type Variant = {
  id: string;
  combination: Record<string, string>;
  price: number | null;
  stock_quantity: number | null;
  enabled: boolean | null;
  image_id?: string | null;
  image_url?: string | null;
};

export function ProductVariantSync({
  images,
  product,
  attributes,
  variants,
  children,
}: {
  images: GalleryImage[];
  product: Product;
  attributes: Attribute[];
  variants: Variant[];
  children: React.ReactNode;
}) {
  const [activeImageId, setActiveImageId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      <div>
        <ProductGallery
          images={images}
          productName={product.name}
          activeImageId={activeImageId}
          onImageSelect={setActiveImageId}
        />
      </div>

      <div>
        {children}
        <div className="mt-6">
          <ProductForm
            product={product}
            attributes={attributes}
            variants={variants}
            activeImageId={activeImageId}
            onVariantImageSelect={setActiveImageId}
          />
        </div>
      </div>
    </div>
  );
}
