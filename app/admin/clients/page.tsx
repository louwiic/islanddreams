import { Search, Mail, Users } from 'lucide-react';
import { getCustomers, getCustomerStats } from '@/lib/actions/customers';

export default async function ClientsPage() {
  const [clients, stats] = await Promise.all([
    getCustomers(),
    getCustomerStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400">Total clients</p>
          <p className="text-2xl font-bold text-ink mt-1">
            {stats.totalCustomers}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400">Avec commandes</p>
          <p className="text-2xl font-bold text-jungle-600 mt-1">
            {stats.ordersByCustomer.size}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {clients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-ink">Aucun client</h3>
            <p className="text-xs text-gray-400 mt-1">
              Les clients apparaîtront après le premier achat.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Téléphone</th>
                  <th className="px-5 py-3 font-medium">Commandes</th>
                  <th className="px-5 py-3 font-medium">Total dépensé</th>
                  <th className="px-5 py-3 font-medium">Inscrit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map((client) => {
                  const orderData = stats.ordersByCustomer.get(client.id);
                  const fullName =
                    `${client.first_name ?? ''} ${client.last_name ?? ''}`.trim();

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-jungle-100 flex items-center justify-center text-xs font-bold text-jungle-700">
                            {fullName
                              ? fullName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()
                              : client.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-ink">
                              {fullName || 'Sans nom'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {client.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {client.phone || '—'}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {orderData?.count ?? 0}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-ink">
                        {orderData
                          ? `${orderData.total.toFixed(2)} €`
                          : '0 €'}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {client.created_at
                          ? new Date(client.created_at).toLocaleDateString(
                              'fr-FR',
                              { month: 'short', year: 'numeric' }
                            )
                          : '—'}
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
