'use client';

import { PackageCheck, X } from 'lucide-react';

type ShippingConfirmationDialogProps = {
  open: boolean;
  orderCount: number;
  isSubmitting?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ShippingConfirmationDialog({
  open,
  orderCount,
  isSubmitting = false,
  error,
  onCancel,
  onConfirm,
}: ShippingConfirmationDialogProps) {
  if (!open) return null;

  const plural = orderCount > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shipping-confirmation-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-jungle-100 text-jungle-700">
            <PackageCheck size={20} />
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Fermer"
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <h2 id="shipping-confirmation-title" className="mt-4 text-lg font-semibold text-ink">
          Confirmer l&apos;expédition{plural ? ' des commandes' : ' de la commande'}
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          {plural
            ? `Un email sera envoyé à chacun des ${orderCount} clients. Le statut de ces commandes sera ensuite verrouillé et ne pourra plus être modifié.`
            : 'Un email sera envoyé au client. Le statut de la commande sera ensuite verrouillé et ne pourra plus être modifié.'}
        </p>
        {error && <p className="mt-3 rounded-lg bg-coral-50 px-3 py-2 text-sm text-coral-700">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-lg bg-jungle-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-jungle-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Envoi en cours...' : 'Confirmer et envoyer l’email'}
          </button>
        </div>
      </div>
    </div>
  );
}
