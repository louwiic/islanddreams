'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { QueueState } from '@/lib/newsletter/queue';

const labels: Record<string, string> = {
  scheduled: 'Planifiée', sending: 'En cours', completed: 'Terminée',
  completed_with_errors: 'Terminée avec erreurs', cancelled: 'Annulée',
};
const date = (value: string) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Indian/Reunion' }).format(new Date(value));

export function ScheduleDashboard() {
  const [state, setState] = useState<(QueueState & { enabled: boolean; observedAt: number }) | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/newsletter/schedules', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Chargement impossible.');
      setState({ ...data, observedAt: Date.now() }); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Chargement impossible.'); }
  }, []);
  useEffect(() => {
    const first = setTimeout(() => void load(), 0);
    const timer = setInterval(() => void load(), 15000);
    return () => { clearTimeout(first); clearInterval(timer); };
  }, [load]);
  const cancel = async (id: string) => {
    if (!confirm('Annuler cet envoi planifié ? Aucun nouvel email ne sera envoyé par cette campagne.')) return;
    setBusy(id);
    try {
      const response = await fetch('/api/admin/newsletter/schedules', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Annulation impossible.'); }
    finally { setBusy(null); }
  };
  const healthy = state?.worker && state.observedAt - Date.parse(state.worker.last_seen_at) < 180000;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><Link href="/admin/newsletter/campagnes" className="text-sm text-gray-500">← Campagnes</Link><h1 className="mt-2 text-2xl font-bold">Envois planifiés</h1><p className="mt-1 text-sm text-gray-500">Toutes les dates sont affichées en heure de La Réunion (UTC+4).</p></div>
        <Link href="/admin/newsletter/campagnes/nouveau" className="rounded-lg bg-jungle-600 px-4 py-2 text-sm font-semibold text-white">Préparer une newsletter</Link>
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {state && <div className="rounded-xl border bg-white p-4 text-sm">
        <p className="font-semibold">{!state.enabled ? 'Envois automatiques désactivés' : !healthy ? 'Service d’envoi à vérifier' : state.worker?.dry_run ? 'Mode simulation : aucun email envoyé' : 'Service d’envoi actif'}</p>
        <p className="mt-1 text-gray-500">{state.worker ? `Dernier passage : ${date(state.worker.last_seen_at)}.` : 'Aucun passage du service enregistré.'} Les abonnés désinscrits sont exclus avant chaque envoi.</p>
      </div>}
      {!state && !error && <p className="text-sm text-gray-500">Chargement…</p>}
      {state?.jobs.length === 0 && <p className="rounded-xl border bg-white p-8 text-center text-gray-500">Aucune campagne planifiée.</p>}
      <div className="space-y-3">{state?.jobs.map(job => <article key={job.id} className="rounded-xl border bg-white p-5">
        <div className="flex flex-wrap justify-between gap-4"><div><h2 className="font-bold">{job.subject}</h2><p className="mt-1 text-sm text-gray-500">{date(job.scheduled_at)}</p></div><span className="text-sm font-semibold text-jungle-700">{labels[job.status]}</span></div>
        <p className="mt-3 text-sm text-gray-600">{job.sent} accepté(s) · {job.skipped} exclu(s) · {job.failed} en erreur · {job.total} destinataire(s) préparé(s)</p>
        {job.status === 'completed_with_errors' && <p className="mt-2 text-sm text-red-600">Certains envois nécessitent une vérification. Ils ne sont pas renvoyés automatiquement après épuisement des tentatives.</p>}
        {job.status === 'scheduled' && <button disabled={busy === job.id} onClick={() => void cancel(job.id)} className="mt-3 text-sm font-semibold text-red-600 disabled:opacity-50">{busy === job.id ? 'Annulation…' : 'Annuler l’envoi'}</button>}
      </article>)}</div>
      <p className="text-xs leading-relaxed text-gray-500">« Accepté » signifie que le service email a pris en charge le message, pas qu’il a été lu ou livré en boîte principale. Une campagne déjà démarrée n’est plus modifiable ni annulable depuis cet écran.</p>
    </div>
  );
}
