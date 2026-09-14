'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { markOrderAsShipped, updateOrderStatus } from '@/lib/actions/orders';
import { ShippingConfirmationDialog } from '@/components/admin/ShippingConfirmationDialog';

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
  const [shippingConfirmationOpen, setShippingConfirmationOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'shipped') {
      setError(null);
      setShippingConfirmationOpen(true);
      return;
    }

    setSaving(true);
    setError(null);
    const result = await updateOrderStatus(orderId, e.target.value);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  };

  const confirmShipping = async () => {
    setSaving(true);
    setError(null);
    const result = await markOrderAsShipped(orderId);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setShippingConfirmationOpen(false);
    router.refresh();
  };

  if (currentStatus === 'shipped') {
    return <span className="rounded-full bg-jungle-100 px-3 py-2 text-sm font-medium text-jungle-700">Expédiée · verrouillée</span>;
  }

  return (
    <>
      <div className="flex flex-col items-end gap-2">
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
        {error && <p className="max-w-xs text-right text-xs text-coral-600">{error}</p>}
      </div>
      <ShippingConfirmationDialog
        open={shippingConfirmationOpen}
        orderCount={1}
        isSubmitting={saving}
        error={error}
        onCancel={() => {
          if (!saving) {
            setError(null);
            setShippingConfirmationOpen(false);
          }
        }}
        onConfirm={confirmShipping}
      />
    </>
  );
}
