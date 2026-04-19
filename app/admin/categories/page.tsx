import { getCategories } from '@/lib/actions/categories';
import { CategoryManager } from '@/components/admin/CategoryManager';

export default async function CategoriesPage() {
  const categories = await getCategories();
  return <CategoryManager initialCategories={categories} />;
}
