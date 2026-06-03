'use client';

import { useMemo, useState, useTransition } from 'react';
import { Copy, Download, Loader2, Plus, QrCode, Save, Trash2 } from 'lucide-react';
import {
  deleteQrCampaign,
  saveQrCampaign,
  type QrCampaign,
  type QrCampaignStats,
} from '@/lib/actions/qr';

type Props = {
  initialCampaigns: QrCampaign[];
  initialStats: Record<string, QrCampaignStats>;
  siteUrl: string;
};

function qrImageUrl(value: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=420x420&format=png&margin=16&data=${encodeURIComponent(value)}`;
}

function last7Days(stats?: QrCampaignStats) {
  const days = [];
  for (let index = 6; index >= 0; index--) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const key = date.toISOString().slice(0, 10);
    days.push({ key, value: stats?.days?.[key] ?? 0 });
  }
  return days;
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Jamais';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function QrCampaignsClient({ initialCampaigns, initialStats, siteUrl }: Props) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [stats, setStats] = useState(initialStats);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [sourceTag, setSourceTag] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('/');
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const totalScans = useMemo(
    () => Object.values(stats).reduce((sum, item) => sum + (item.total ?? 0), 0),
    [stats]
  );

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSourceTag('');
    setDestinationUrl('/');
    setIsActive(true);
  };

  const handleEdit = (campaign: QrCampaign) => {
    setEditingId(campaign.id);
    setName(campaign.name);
    setSourceTag(campaign.sourceTag);
    setDestinationUrl(campaign.destinationUrl);
    setIsActive(campaign.isActive);
    setMessage('');
    setError('');
  };

  const handleSave = () => {
    setMessage('');
    setError('');
    startTransition(async () => {
      const result = await saveQrCampaign({
        id: editingId ?? undefined,
        name,
        sourceTag,
        destinationUrl,
        isActive,
      });

      if (result.error || !result.campaign) {
        setError(result.error || 'Impossible d’enregistrer le QR code.');
        return;
      }

      setCampaigns((current) => {
        const exists = current.some((campaign) => campaign.id === result.campaign!.id);
        return exists
          ? current.map((campaign) =>
              campaign.id === result.campaign!.id ? result.campaign! : campaign
            )
          : [result.campaign!, ...current];
      });
      setMessage('QR code enregistré.');
      resetForm();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Supprimer ce QR code et ses statistiques ?')) return;
    startTransition(async () => {
      await deleteQrCampaign(id);
      setCampaigns((current) => current.filter((campaign) => campaign.id !== id));
      setStats((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">QR codes</p>
          <p className="mt-2 text-2xl font-bold text-ink">{campaigns.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Scans total</p>
          <p className="mt-2 text-2xl font-bold text-ink">{totalScans}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Actifs</p>
          <p className="mt-2 text-2xl font-bold text-ink">
            {campaigns.filter((campaign) => campaign.isActive).length}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <QrCode size={18} className="text-jungle-600" />
            <h2 className="font-semibold text-ink">
              {editingId ? 'Modifier le QR code' : 'Nouveau QR code'}
            </h2>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Annuler
            </button>
          )}
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-[1fr_1fr_auto]">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Spot pub Saint-Denis"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tag source</label>
            <input
              type="text"
              value={sourceTag}
              onChange={(event) => setSourceTag(event.target.value)}
              placeholder="spot-pub-saint-denis"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
            />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="rounded border-gray-300 text-jungle-600 focus:ring-jungle-500"
            />
            Actif
          </label>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">URL cible</label>
            <input
              type="text"
              value={destinationUrl}
              onChange={(event) => setDestinationUrl(event.target.value)}
              placeholder="/boutique ou https://..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-jungle-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-jungle-700 disabled:opacity-50 md:self-end"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : editingId ? <Save size={16} /> : <Plus size={16} />}
            {editingId ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
        {(message || error) && (
          <div className="px-6 pb-5 text-sm">
            {message && <p className="text-jungle-600">{message}</p>}
            {error && <p className="text-coral-600">{error}</p>}
          </div>
        )}
      </section>

      <section className="space-y-4">
        {campaigns.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
            Aucun QR code pour le moment.
          </div>
        ) : (
          campaigns.map((campaign) => {
            const trackedUrl = `${siteUrl}/q/${campaign.id}`;
            const campaignStats = stats[campaign.id];
            const days = last7Days(campaignStats);
            const maxDay = Math.max(...days.map((day) => day.value), 1);

            return (
              <article key={campaign.id} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="grid gap-5 lg:grid-cols-[180px_1fr_auto]">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrImageUrl(trackedUrl)}
                      alt={`QR code ${campaign.name}`}
                      className="h-full w-full rounded-lg bg-white"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-ink">{campaign.name}</h3>
                      <span className="rounded-full bg-jungle-50 px-2 py-0.5 text-xs font-medium text-jungle-700">
                        {campaign.sourceTag}
                      </span>
                      {!campaign.isActive && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                          Inactif
                        </span>
                      )}
                    </div>
                    <p className="mt-2 truncate text-sm text-gray-500">{trackedUrl}</p>
                    <p className="mt-1 truncate text-xs text-gray-400">
                      Redirection : {campaign.destinationUrl}
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-400">Scans</p>
                        <p className="text-xl font-bold text-ink">{campaignStats?.total ?? 0}</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-400">Dernier scan</p>
                        <p className="text-sm font-medium text-ink">
                          {formatDate(campaignStats?.lastScannedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex h-16 items-end gap-1 rounded-lg bg-gray-50 p-3">
                      {days.map((day) => (
                        <div key={day.key} className="flex flex-1 flex-col items-center gap-1">
                          <div
                            className="w-full rounded-t bg-jungle-500"
                            style={{ height: `${Math.max((day.value / maxDay) * 40, day.value ? 6 : 2)}px` }}
                            title={`${day.key}: ${day.value}`}
                          />
                          <span className="text-[9px] text-gray-400">{day.key.slice(5)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:flex-col">
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(trackedUrl)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      <Copy size={15} />
                      Copier
                    </button>
                    <a
                      href={qrImageUrl(trackedUrl)}
                      download={`qr-${campaign.sourceTag}.png`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      <Download size={15} />
                      PNG
                    </a>
                    <button
                      type="button"
                      onClick={() => handleEdit(campaign)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(campaign.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-coral-100 px-3 py-2 text-sm text-coral-600 hover:bg-coral-50"
                    >
                      <Trash2 size={15} />
                      Supprimer
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
