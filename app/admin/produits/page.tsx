import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Package,
  Upload,
  MoreHorizontal,
  Star,
  Pencil,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getProducts } from '@/lib/actions/products';

const CATEGORY_LABELS: Record<string, string> = {
  magnets: 'Magnets',
  stickers: 'Stickers',
  textile: 'Textile',
  goodies: 'Goodies',
  decoration: 'Décoration',
  uncategorized: 'Non classé',
};

export default async function ProduitsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      {/* Barre d'actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 bg-white"
            />
          </div>
          <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Filter size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/produits/import"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Upload size={16} />
            <span className="hidden sm:inline">Importer</span>
          </Link>
          <Link
            href="/admin/produits/nouveau"
            className="flex items-center gap-2 px-4 py-2.5 bg-jungle-600 text-white rounded-lg text-sm font-medium hover:bg-jungle-700 transition-colors"
          >
            <Plus size={16} />
            Ajouter
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Package size={24} className="text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-ink">Aucun produit</h3>
            <p className="text-xs text-gray-400 mt-1">
              Commencez par ajouter un produit ou importer un CSV.
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Link
                href="/admin/produits/import"
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Importer CSV
              </Link>
              <Link
                href="/admin/produits/nouveau"
                className="px-4 py-2 text-sm font-medium text-white bg-jungle-600 rounded-lg hover:bg-jungle-700 transition-colors"
              >
                Ajouter un produit
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="px-5 py-3 font-medium">Produit</th>
                    <th className="px-5 py-3 font-medium">Catégorie</th>
                    <th className="px-5 py-3 font-medium">Prix</th>
                    <th className="px-5 py-3 font-medium">Stock</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3 font-medium w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/produits/${product.id}`}
                          className="flex items-center gap-3 group/link"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <Package size={16} className="text-gray-400" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-ink group-hover/link:text-jungle-600 transition-colors">
                              {product.name}
                            </span>
                            {product.featured && (
                              <Star
                                size={12}
                                className="inline ml-1.5 text-sun-500 fill-sun-500"
                              />
                            )}
                            {product.sku && (
                              <p className="text-[11px] text-gray-400 font-mono">
                                {product.sku}
                              </p>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {CATEGORY_LABELS[product.category ?? 'uncategorized']}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm font-medium text-ink">
                          {product.price.toFixed(2)} €
                        </span>
                        {product.sale_price && (
                          <span className="ml-1 text-[10px] text-coral-500 font-medium">
                            PROMO
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {product.manage_stock ? (
                          <span
                            className={`text-sm font-medium ${
                              (product.stock_quantity ?? 0) <=
                              (product.low_stock_threshold ?? 5)
                                ? 'text-coral-500'
                                : 'text-gray-600'
                            }`}
                          >
                            {product.stock_quantity ?? 0}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                            product.status === 'publish'
                              ? 'bg-jungle-50 text-jungle-600'
                              : product.status === 'private'
                                ? 'bg-ocean-50 text-ocean-600'
                                : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {product.status === 'publish'
                            ? 'Publié'
                            : product.status === 'private'
                              ? 'Privé'
                              : 'Brouillon'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="relative group/menu">
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                            <MoreHorizontal
                              size={16}
                              className="text-gray-400"
                            />
                          </button>
                          <div className="hidden group-hover/menu:block absolute right-0 top-full z-10 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                            <Link
                              href={`/admin/produits/${product.id}`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Pencil size={14} /> Modifier
                            </Link>
                            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                              <Copy size={14} /> Dupliquer
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 text-sm text-coral-600 hover:bg-coral-50 w-full">
                              <Trash2 size={14} /> Supprimer
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {products.length} produit{products.length > 1 ? 's' : ''}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
