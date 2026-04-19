'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrderStatus } from '@/lib/actions/orders';

const STATUSES = [
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'preparing', label: 'En préparation' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
  { value: 'refunded', label: 'Remboursée' },
];

export function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSaving(true);
    await updateOrderStatus(orderId, e.target.value);
    setSaving(false);
    router.refresh();
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={saving}
      className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 bg-white disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
