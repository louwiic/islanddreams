import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';
import { getProductById } from '@/lib/actions/products';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProduitPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  const initialData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? '',
    shortDescription: product.short_description ?? '',
    category: product.category ?? 'uncategorized',
    tags: product.tags ?? [],
    price: product.price.toString().replace('.', ','),
    salePrice: product.sale_price?.toString().replace('.', ',') ?? '',
    sku: product.sku ?? '',
    manageStock: product.manage_stock ?? false,
    stockQuantity: product.stock_quantity?.toString() ?? '',
    lowStockThreshold: (product.low_stock_threshold ?? 5).toString(),
    weight: product.weight_grams?.toString() ?? '',
    status: product.status ?? 'draft',
    featured: product.featured ?? false,
    metaTitle: product.meta_title ?? '',
    metaDescription: product.meta_description ?? '',
    focusKeyword: product.focus_keyword ?? '',
    images: [],
    attributes: product.attributes.map((a) => ({
      id: a.id,
      name: a.name,
      values: a.values,
    })),
    variants: product.variants.map((v) => ({
      id: v.id,
      combination: v.combination as Record<string, string>,
      price: v.price?.toString() ?? '',
      sku: v.sku ?? '',
      stock: v.stock_quantity?.toString() ?? '',
      enabled: v.enabled ?? true,
    })),
  };

  return <ProductForm mode="edit" initialData={initialData} />;
}
