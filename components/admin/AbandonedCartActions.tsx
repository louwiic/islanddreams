'use client';

import { useTransition } from 'react';
import { RefreshCw, XCircle } from 'lucide-react';
import { cancelAbandonedCart, reactivateAbandonedCart } from '@/lib/actions/abandoned-carts';

export function AbandonedCartActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const canCancel = status === 'active' || status === 'sending';
  const canReactivate = status === 'cancelled' || status === 'expired';

  if (!canCancel && !canReactivate) {
    return <span className="text-xs text-gray-300">-</span>;
  }

  return (
    <div className="flex justify-end gap-2">
      {canReactivate && (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => { void reactivateAbandonedCart(id); })}
          className="inline-flex items-center gap-1.5 rounded-lg border border-jungle-200 px-2.5 py-1.5 text-xs font-semibold text-jungle-700 transition-colors hover:bg-jungle-50 disabled:opacity-50"
        >
          <RefreshCw size={13} />
          Relancer
        </button>
      )}
      {canCancel && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!window.confirm('Annuler les relances de ce panier ?')) return;
            startTransition(() => { void cancelAbandonedCart(id); });
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          <XCircle size={13} />
          Annuler
        </button>
      )}
    </div>
  );
}

