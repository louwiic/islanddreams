'use client';

import { useMemo, useState, useTransition } from 'react';
import { Check, Copy, Gift, Loader2, Plus, XCircle } from 'lucide-react';
import {
  createAdminVoucher,
  deactivateAdminVoucher,
  type AdminVoucher,
} from '@/lib/actions/vouchers';
import { cn } from '@/lib/utils';

function defaultExpiryDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
}

function formatDate(value: string | null) {
  if (!value) return 'Sans date';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function voucherStatus(voucher: AdminVoucher) {
  if (voucher.timesRedeemed > 0) return { label: 'Utilisé', className: 'bg-gray-100 text-gray-600' };
  if (!voucher.active) return { label: 'Désactivé', className: 'bg-gray-100 text-gray-500' };
  if (voucher.expiresAt && new Date(voucher.expiresAt).getTime() < Date.now()) {
    return { label: 'Expiré', className: 'bg-coral-50 text-coral-600' };
  }
  return { label: 'Actif', className: 'bg-jungle-50 text-jungle-700' };
}

export function VouchersClient({ initialVouchers }: { initialVouchers: AdminVoucher[] }) {
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [amount, setAmount] = useState('25');
  const [expiresAt, setExpiresAt] = useState(defaultExpiryDate());
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [note, setNote] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const [isPending, startTransition] = useTransition();

  const stats = useMemo(() => {
    return {
      total: vouchers.length,
      active: vouchers.filter((voucher) => voucherStatus(voucher).label === 'Actif').length,
      used: vouchers.filter((voucher) => voucher.timesRedeemed > 0).length,
    };
  }, [vouchers]);

  const resetForm = () => {
    setAmount('25');
    setExpiresAt(defaultExpiryDate());
    setRecipientName('');
    setRecipientEmail('');
    setNote('');
    setCode('');
  };

  const handleCreate = () => {
    setMessage('');
    setError('');
    startTransition(async () => {
      const result = await createAdminVoucher({
        amount,
        expiresAt,
        recipientName,
        recipientEmail,
        note,
        code,
      });

      if (result.error || !result.voucher) {
        setError(result.error || 'Impossible de créer le bon d’achat.');
        return;
      }

      setVouchers((current) => [result.voucher!, ...current]);
      setMessage(`Bon d’achat créé : ${result.voucher.code}`);
      resetForm();
    });
  };

  const handleDeactivate = (voucher: AdminVoucher) => {
    if (!confirm(`Désactiver le code ${voucher.code} ?`)) return;
    startTransition(async () => {
      const result = await deactivateAdminVoucher(voucher.id);
      if (result.voucher) {
        setVouchers((current) =>
          current.map((item) => (item.id === voucher.id ? result.voucher! : item))
        );
      }
    });
  };

  const copyCode = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedCode(value);
    setTimeout(() => setCopiedCode(''), 1800);
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Bons créés</p>
          <p className="mt-2 text-2xl font-bold text-ink">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Actifs</p>
          <p className="mt-2 text-2xl font-bold text-ink">{stats.active}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Utilisés</p>
          <p className="mt-2 text-2xl font-bold text-ink">{stats.used}</p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
          <Gift size={18} className="text-jungle-600" />
          <h2 className="font-semibold text-ink">Créer un bon d’achat offert</h2>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Montant du bon (€)
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Date limite d’usage
            </label>
            <input
              type="date"
              value={expiresAt}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(event) => setExpiresAt(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nom du client / destinataire
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              placeholder="Ex : Marie Payet"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email associé
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
              placeholder="client@email.com"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Code personnalisé optionnel
            </label>
            <input
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="Laisser vide pour générer"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase tracking-wide focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Note interne
            </label>
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ex : cadeau SAV, jeu concours..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-4">
          <div className="text-sm">
            {message && <p className="text-jungle-600">{message}</p>}
            {error && <p className="text-coral-600">{error}</p>}
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={isPending || !amount || !expiresAt}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-jungle-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-jungle-700 disabled:opacity-50"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Créer le bon
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-ink">Bons d’achat générés</h2>
          <p className="mt-1 text-sm text-gray-500">
            Ces codes sont utilisables une seule fois dans le champ code promo du panier.
          </p>
        </div>

        {vouchers.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            Aucun bon d’achat créé depuis l’admin.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {vouchers.map((voucher) => {
              const status = voucherStatus(voucher);
              return (
                <article key={voucher.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyCode(voucher.code)}
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 font-mono text-sm font-bold text-ink ring-1 ring-gray-200 transition-colors hover:bg-gray-100"
                      >
                        {voucher.code}
                        {copiedCode === voucher.code ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', status.className)}>
                        {status.label}
                      </span>
                      <span className="text-sm font-bold text-jungle-700">
                        {voucher.amount.toFixed(2)} €
                      </span>
                    </div>
                    <div className="mt-3 grid gap-1 text-sm text-gray-500 sm:grid-cols-2">
                      <p>Créé le {formatDate(voucher.createdAt)}</p>
                      <p>Valable jusqu’au {formatDate(voucher.expiresAt)}</p>
                      {voucher.recipientName && <p>Client : {voucher.recipientName}</p>}
                      {voucher.recipientEmail && <p>Email : {voucher.recipientEmail}</p>}
                      {voucher.note && <p className="sm:col-span-2">Note : {voucher.note}</p>}
                    </div>
                  </div>
                  <div className="flex items-start justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeactivate(voucher)}
                      disabled={!voucher.active || voucher.timesRedeemed > 0 || isPending}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
                    >
                      <XCircle size={15} />
                      Désactiver
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
