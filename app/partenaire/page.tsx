import { redirect } from 'next/navigation';
import { Building2, Euro, MousePointerClick, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getQrCampaigns, getQrConversions, getQrStats } from '@/lib/actions/qr';
import { PartnerLogout } from './PartnerLogout';

export const dynamic = 'force-dynamic';

export default async function PartnerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect('/partenaire/connexion');

  const email = user.email.toLowerCase();
  const [campaigns, stats, conversions] = await Promise.all([getQrCampaigns(), getQrStats(), getQrConversions()]);
  const partnerCampaigns = campaigns.filter((campaign) => campaign.partnerEnabled && campaign.partnerEmail?.toLowerCase() === email);
  if (partnerCampaigns.length === 0) {
    return <main className="min-h-screen bg-gray-50 p-6"><div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center"><h1 className="text-xl font-bold">Accès partenaire non configuré</h1><p className="mt-2 text-sm text-gray-500">Votre compte est connecté, mais aucun QR partenaire n’est associé à {email}.</p><div className="mt-6"><PartnerLogout /></div></div></main>;
  }

  const campaignIds = new Set(partnerCampaigns.map((campaign) => campaign.id));
  const partnerConversions = conversions.filter((conversion) => campaignIds.has(conversion.campaignId));
  const validConversions = partnerConversions.filter((conversion) => conversion.status !== 'cancelled');
  const scans = partnerCampaigns.reduce((sum, campaign) => sum + (stats[campaign.id]?.total ?? 0), 0);
  const pageViews = partnerCampaigns.reduce((sum, campaign) => sum + (stats[campaign.id]?.pageViews ?? 0), 0);
  const revenue = validConversions.reduce((sum, conversion) => sum + conversion.orderTotal, 0);
  const commission = validConversions.reduce((sum, conversion) => sum + conversion.commissionAmount, 0);
  const pathTotals = new Map<string, number>();
  for (const campaign of partnerCampaigns) {
    for (const [path, count] of Object.entries(stats[campaign.id]?.paths ?? {})) {
      pathTotals.set(path, (pathTotals.get(path) ?? 0) + count);
    }
  }
  const topPaths = [...pathTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const cartViews = [...pathTotals.entries()].filter(([path]) => path.startsWith('/panier')).reduce((sum, [, count]) => sum + count, 0);

  return <main className="min-h-screen bg-gray-50 px-4 py-8">
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-gray-500">Island Dreams</p><h1 className="text-2xl font-bold text-ink">Espace partenaire — {partnerCampaigns[0].partnerName || email}</h1></div><PartnerLogout /></header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[[MousePointerClick, 'Scans', scans], [MousePointerClick, 'Pages vues', pageViews], [ShoppingBag, 'Commandes', validConversions.length], [Euro, 'Chiffre d’affaires', `${revenue.toFixed(2)} €`], [Building2, 'Commission', `${commission.toFixed(2)} €`]].map(([Icon, label, value]) => { const CardIcon = Icon as typeof Building2; return <div key={String(label)} className="rounded-xl border border-gray-200 bg-white p-5"><CardIcon size={18} className="text-jungle-600"/><p className="mt-3 text-sm text-gray-500">{String(label)}</p><p className="mt-1 text-2xl font-bold text-ink">{String(value)}</p></div>; })}
      </div>
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5"><h2 className="font-semibold text-ink">Parcours d’achat</h2><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-lg bg-gray-50 p-3"><p className="text-2xl font-bold">{scans}</p><p className="text-xs text-gray-500">Scans</p></div><div className="rounded-lg bg-gray-50 p-3"><p className="text-2xl font-bold">{cartViews}</p><p className="text-xs text-gray-500">Passages panier</p></div><div className="rounded-lg bg-gray-50 p-3"><p className="text-2xl font-bold">{validConversions.length}</p><p className="text-xs text-gray-500">Achats</p></div></div><p className="mt-4 text-xs text-gray-500">Conversion scan → achat : <strong className="text-ink">{scans > 0 ? ((validConversions.length / scans) * 100).toFixed(1) : '0.0'} %</strong></p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-5"><h2 className="font-semibold text-ink">Pages les plus consultées</h2><div className="mt-4 space-y-2">{topPaths.map(([path, count]) => <div key={path} className="flex items-center justify-between gap-4 text-sm"><span className="truncate text-gray-600">{path}</span><span className="font-semibold text-ink">{count}</span></div>)}{topPaths.length === 0 && <p className="text-sm text-gray-400">Aucune page consultée pour le moment.</p>}</div></div>
      </section>
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white"><div className="border-b border-gray-100 px-5 py-4"><h2 className="font-semibold">Commandes attribuées</h2></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-500"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">QR code</th><th className="px-5 py-3">Commande</th><th className="px-5 py-3">Montant</th><th className="px-5 py-3">Commission</th><th className="px-5 py-3">Statut</th></tr></thead><tbody>{partnerConversions.map((conversion) => <tr key={conversion.id} className="border-t border-gray-100"><td className="px-5 py-3">{new Intl.DateTimeFormat('fr-FR').format(new Date(conversion.createdAt))}</td><td className="px-5 py-3">{partnerCampaigns.find((campaign) => campaign.id === conversion.campaignId)?.name}</td><td className="px-5 py-3 font-mono">{conversion.orderId.slice(0, 8).toUpperCase()}</td><td className="px-5 py-3">{conversion.orderTotal.toFixed(2)} €</td><td className="px-5 py-3 font-semibold">{conversion.commissionAmount.toFixed(2)} €</td><td className="px-5 py-3">{conversion.status}</td></tr>)}</tbody></table>{partnerConversions.length === 0 && <p className="p-8 text-center text-sm text-gray-400">Aucune commande attribuée pour le moment.</p>}</div></section>
    </div>
  </main>;
}
