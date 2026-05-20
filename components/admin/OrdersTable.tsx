'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Eye, ShoppingCart, X } from 'lucide-react';
import { updateOrderStatus } from '@/lib/actions/orders';
import { useRouter } from 'next/navigation';

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

const BULK_ACTIONS = [
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'preparing', label: 'En préparation' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
  { value: 'refunded', label: 'Remboursée' },
];

type Order = {
  id: string;
  order_number: string;
  status: string | null;
  total: number;
  created_at: string | null;
  customers: { first_name: string | null; last_name: string | null; email: string } | null;
};

export function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const allSelected = orders.length > 0 && selected.size === orders.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(orders.map((o) => o.id)));
    }
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkAction = (status: string) => {
    if (selected.size === 0) return;
    const count = selected.size;
    const label = STATUS_LABELS[status] ?? status;
    if (!confirm(`Passer ${count} commande${count > 1 ? 's' : ''} en "${label}" ?`)) return;

    startTransition(async () => {
      await Promise.all(
        Array.from(selected).map((id) => updateOrderStatus(id, status))
      );
      setSelected(new Set());
      router.refresh();
    });
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <ShoppingCart size={24} className="text-gray-400" />
        </div>
        <h3 className="text-sm font-semibold text-ink">Aucune commande</h3>
        <p className="text-xs text-gray-400 mt-1">
          Les commandes apparaîtront ici après le premier achat.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Barre d'actions en masse */}
      {selected.size > 0 && (
        <div className="sticky top-0 z-20 bg-jungle-700 text-white rounded-xl px-4 py-3 mb-3 flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelected(new Set())} className="p-1 hover:bg-white/20 rounded transition-colors">
              <X size={16} />
            </button>
            <span className="text-sm font-medium">
              {selected.size} commande{selected.size > 1 ? 's' : ''} sélectionnée{selected.size > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {BULK_ACTIONS.map((action) => (
              <button
                key={action.value}
                onClick={() => handleBulkAction(action.value)}
                disabled={isPending}
                className="px-3 py-1.5 text-xs font-medium bg-white/15 hover:bg-white/25 rounded-lg transition-colors disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-jungle-600 focus:ring-jungle-500"
                  />
                </th>
                <th className="px-4 py-3 font-medium">Commande</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => {
                const customer = order.customers;
                const clientName = customer
                  ? `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim() || customer.email
                  : 'Client anonyme';
                const isChecked = selected.has(order.id);

                return (
                  <tr
                    key={order.id}
                    className={`transition-colors ${isChecked ? 'bg-jungle-50/50' : 'hover:bg-gray-50/50'}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(order.id)}
                        className="rounded border-gray-300 text-jungle-600 focus:ring-jungle-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/commandes/${order.id}`}
                        className="text-sm font-medium text-ink hover:text-jungle-600 transition-colors"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-ink">{clientName}</p>
                      {customer?.email && (
                        <p className="text-xs text-gray-400">{customer.email}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-ink">
                      {order.total.toFixed(2)} €
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                          STATUS_COLORS[order.status ?? 'pending'] ?? 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {STATUS_LABELS[order.status ?? 'pending'] ?? order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
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
      </div>
    </div>
  );
}
