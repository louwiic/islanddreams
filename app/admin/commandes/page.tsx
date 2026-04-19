import Link from 'next/link';
import { Search, Eye, ShoppingCart } from 'lucide-react';
import { getOrders, getOrderStats } from '@/lib/actions/orders';

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
  cancelled: 'bg-coral-100 text-coral-600',
  refunded: 'bg-gray-100 text-gray-500',
};

export default async function CommandesPage() {
  const [orders, stats] = await Promise.all([getOrders(), getOrderStats()]);

  return (
    <div className="space-y-6">
      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400">Total commandes</p>
          <p className="text-2xl font-bold text-ink mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400">Chiffre d&apos;affaires</p>
          <p className="text-2xl font-bold text-jungle-600 mt-1">
            {stats.revenue.toFixed(2)} €
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400">En attente</p>
          <p className="text-2xl font-bold text-sun-600 mt-1">
            {(stats.byStatus.pending ?? 0) + (stats.byStatus.confirmed ?? 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400">Expédiées</p>
          <p className="text-2xl font-bold text-ocean-600 mt-1">
            {stats.byStatus.shipped ?? 0}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={24} className="text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-ink">
              Aucune commande
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Les commandes apparaîtront ici après le premier achat.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Commande</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 font-medium w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => {
                  const customer = order.customers as any;
                  const clientName = customer
                    ? `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim() || customer.email
                    : 'Client anonyme';

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/commandes/${order.id}`}
                          className="text-sm font-medium text-ink hover:text-jungle-600 transition-colors"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-ink">{clientName}</p>
                        {customer?.email && (
                          <p className="text-xs text-gray-400">
                            {customer.email}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString(
                              'fr-FR',
                              { day: 'numeric', month: 'short', year: 'numeric' }
                            )
                          : '—'}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-ink">
                        {order.total.toFixed(2)} €
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                            STATUS_COLORS[order.status ?? 'pending'] ??
                            'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {STATUS_LABELS[order.status ?? 'pending'] ??
                            order.status}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
