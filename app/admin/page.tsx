import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { getDashboardStats } from '@/lib/actions/dashboard';

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-sun-100 text-sun-600',
  confirmed: 'bg-ocean-100 text-ocean-600',
  preparing: 'bg-ocean-100 text-ocean-600',
  shipped: 'bg-jungle-100 text-jungle-600',
  delivered: 'bg-gray-100 text-gray-500',
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">CA total</p>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-jungle-50 text-jungle-600">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-ink mt-2">
            {stats.revenue.toFixed(2)} €
          </p>
          <p className="text-xs text-jungle-600 mt-1 flex items-center gap-1">
            <TrendingUp size={12} />
            {stats.monthRevenue.toFixed(2)} € ce mois
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Commandes</p>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-ocean-50 text-ocean-600">
              <ShoppingCart size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-ink mt-2">
            {stats.totalOrders}
          </p>
          {stats.pendingOrders > 0 && (
            <p className="text-xs text-sun-600 mt-1">
              {stats.pendingOrders} en attente
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Produits actifs</p>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-sun-50 text-sun-600">
              <Package size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-ink mt-2">
            {stats.totalProducts}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Clients</p>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-coral-50 text-coral-600">
              <Users size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-ink mt-2">
            {stats.totalCustomers}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commandes récentes */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-ink">Commandes récentes</h2>
            <Link
              href="/admin/commandes"
              className="text-xs text-jungle-600 hover:underline"
            >
              Voir tout
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              Aucune commande pour le moment
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                    <th className="px-5 py-3 font-medium">Commande</th>
                    <th className="px-5 py-3 font-medium">Client</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3 font-medium w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3 text-sm font-medium text-ink">
                        {order.orderNumber}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {order.clientName}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-ink">
                        {order.total.toFixed(2)} €
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                            STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/commandes/${order.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors inline-block"
                        >
                          <Eye size={14} className="text-gray-400" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stock faible */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <AlertTriangle size={16} className="text-coral-500" />
            <h2 className="font-semibold text-ink">Stock faible</h2>
          </div>
          {stats.lowStock.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              Tous les stocks sont OK
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {stats.lowStock.map((product) => (
                <Link
                  key={product.slug}
                  href={`/admin/produits`}
                  className="flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-400">{product.category}</p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      product.stock <= product.threshold
                        ? 'text-coral-500'
                        : 'text-gray-600'
                    }`}
                  >
                    {product.stock}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
