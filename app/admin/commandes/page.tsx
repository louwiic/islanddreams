import { getOrders, getOrderStats } from '@/lib/actions/orders';
import { OrdersTable } from '@/components/admin/OrdersTable';

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

      <OrdersTable orders={orders as any} />
    </div>
  );
}
