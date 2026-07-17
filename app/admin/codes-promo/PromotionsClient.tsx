'use client';

import { useMemo, useState, useTransition } from 'react';
import { Copy, Loader2, Plus, Tag, XCircle } from 'lucide-react';
import { createAdminPromotion, deactivateAdminPromotion, type AdminPromotion } from '@/lib/actions/promotions';

const dateLabel = (value: string | null) => value ? new Intl.DateTimeFormat('fr-FR').format(new Date(value)) : 'Sans limite';

function statusOf(promo: AdminPromotion) {
  const now = Date.now();
  if (!promo.active) return 'Désactivé';
  if (promo.validFrom && new Date(promo.validFrom).getTime() > now) return 'Programmé';
  if (promo.expiresAt && new Date(promo.expiresAt).getTime() < now) return 'Expiré';
  if (promo.maxRedemptions && promo.timesRedeemed >= promo.maxRedemptions) return 'Épuisé';
  return 'Actif';
}

export function PromotionsClient({ initialPromotions }: { initialPromotions: AdminPromotion[] }) {
  const [promotions, setPromotions] = useState(initialPromotions);
  const [form, setForm] = useState({ code: '', name: '', discountType: 'percent' as 'percent' | 'amount', value: '10', validFrom: '', expiresAt: '', minimumAmount: '', maxRedemptions: '', note: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const activeCount = useMemo(() => promotions.filter((promo) => statusOf(promo) === 'Actif').length, [promotions]);
  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const create = () => startTransition(async () => {
    setMessage(''); setError('');
    const result = await createAdminPromotion(form);
    if (result.error || !result.promotion) return setError(result.error || 'Création impossible.');
    setPromotions((current) => [result.promotion!, ...current]);
    setMessage(`Code ${result.promotion.code} créé dans Stripe.`);
    setForm({ code: '', name: '', discountType: 'percent', value: '10', validFrom: '', expiresAt: '', minimumAmount: '', maxRedemptions: '', note: '' });
  });

  const deactivate = (promo: AdminPromotion) => {
    if (!confirm(`Désactiver ${promo.code} ?`)) return;
    startTransition(async () => {
      const result = await deactivateAdminPromotion(promo.id);
      if (result.promotion) setPromotions((current) => current.map((item) => item.id === promo.id ? result.promotion! : item));
    });
  };

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold text-gray-900">Codes promo</h1><p className="mt-1 text-sm text-gray-500">Créez et suivez les réductions appliquées directement par Stripe.</p></div>
    <div className="grid gap-4 sm:grid-cols-3">{[['Codes créés', promotions.length], ['Actifs', activeCount], ['Utilisations', promotions.reduce((sum, item) => sum + item.timesRedeemed, 0)]].map(([label, value]) => <div key={String(label)} className="rounded-xl border bg-white p-5"><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}</div>
    <section className="rounded-xl border bg-white"><div className="flex items-center gap-2 border-b px-6 py-4"><Tag size={18}/><h2 className="font-semibold">Nouveau code promo</h2></div>
      <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm">Code<input value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} className="mt-1 w-full rounded-lg border px-3 py-2 uppercase" placeholder="ETE2026"/></label>
        <label className="text-sm">Nom<input value={form.name} onChange={(e) => set('name', e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="Promotion été"/></label>
        <label className="text-sm">Type<select value={form.discountType} onChange={(e) => set('discountType', e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2"><option value="percent">Pourcentage</option><option value="amount">Montant fixe</option></select></label>
        <label className="text-sm">Réduction ({form.discountType === 'percent' ? '%' : '€'})<input type="number" min="0.01" step="0.01" value={form.value} onChange={(e) => set('value', e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2"/></label>
        <label className="text-sm">Début<input type="date" value={form.validFrom} onChange={(e) => set('validFrom', e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2"/></label>
        <label className="text-sm">Fin<input type="date" value={form.expiresAt} onChange={(e) => set('expiresAt', e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2"/></label>
        <label className="text-sm">Commande minimum (€)<input type="number" min="0" step="0.01" value={form.minimumAmount} onChange={(e) => set('minimumAmount', e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="Aucun"/></label>
        <label className="text-sm">Utilisations maximum<input type="number" min="1" value={form.maxRedemptions} onChange={(e) => set('maxRedemptions', e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="Illimité"/></label>
        <label className="text-sm lg:col-span-3">Note interne<input value={form.note} onChange={(e) => set('note', e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2"/></label>
        <button onClick={create} disabled={pending || !form.code || !form.name || !form.value} className="self-end rounded-lg bg-jungle-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{pending ? <Loader2 size={16} className="mx-auto animate-spin"/> : <span className="inline-flex items-center gap-2"><Plus size={16}/>Créer</span>}</button>
      </div>{(message || error) && <div className="border-t px-6 py-3 text-sm">{message && <p className="text-jungle-700">{message}</p>}{error && <p className="text-coral-600">{error}</p>}</div>}
    </section>
    <section className="divide-y rounded-xl border bg-white">{promotions.length === 0 ? <p className="p-8 text-center text-sm text-gray-400">Aucun code promo créé depuis cet espace.</p> : promotions.map((promo) => <article key={promo.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><div className="flex flex-wrap items-center gap-2"><button onClick={() => navigator.clipboard.writeText(promo.code)} className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 font-mono font-bold"><Copy size={14}/>{promo.code}</button><strong>{promo.discountType === 'percent' ? `${promo.value}%` : `${promo.value.toFixed(2)} €`}</strong><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{statusOf(promo)}</span></div><p className="mt-2 text-sm text-gray-600">{promo.name} · du {dateLabel(promo.validFrom)} au {dateLabel(promo.expiresAt)}</p><p className="mt-1 text-xs text-gray-400">{promo.timesRedeemed}/{promo.maxRedemptions ?? '∞'} utilisation(s){promo.minimumAmount ? ` · minimum ${promo.minimumAmount.toFixed(2)} €` : ''}</p></div><button onClick={() => deactivate(promo)} disabled={!promo.active || pending} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm disabled:opacity-40"><XCircle size={15}/>Désactiver</button></article>)}</section>
  </div>;
}
