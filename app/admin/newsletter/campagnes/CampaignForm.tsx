'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, CheckSquare, Eye, EyeOff, Loader2, Save, Send } from 'lucide-react';
import { reunionDateToIso } from '@/lib/newsletter/scheduling';

type Props = {
  initial?: {
    id: string;
    name: string;
    content?: string;
    recipientSources?: RecipientSource[];
  };
};

type RecipientSource = 'newsletter' | 'contacts' | 'contest';

type RecipientGroup = {
  source: RecipientSource;
  label: string;
  description: string;
  count: number;
  preview: string[];
};

const defaultSubject = 'Les nouvelles péi d’Island Dreams';
const defaultNewsletterHtml = `<h2>Un petit bout de La Réunion à partager</h2>
<p>Découvrez notre sélection de souvenirs péi et trouvez une attention pour vos proches.</p>
<p><a href="https://islanddreams.re/boutique">Découvrir la boutique</a></p>`;

export function CampaignForm({ initial }: Props) {
  const router = useRouter();
  const [subject, setSubject] = useState(initial?.name ?? defaultSubject);
  const [content, setContent] = useState(initial?.content || defaultNewsletterHtml);
  const [recipientSources, setRecipientSources] = useState<RecipientSource[]>(
    initial?.recipientSources?.length ? initial.recipientSources : ['newsletter']
  );
  const [recipientGroups, setRecipientGroups] = useState<RecipientGroup[]>([]);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const scheduleRequest = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/newsletter/recipients')
      .then((res) => res.json())
      .then((data: { groups?: RecipientGroup[] }) => {
        if (!cancelled) setRecipientGroups(data.groups ?? []);
      })
      .catch(() => {
        if (!cancelled) setRecipientGroups([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCount = recipientGroups
    .filter((group) => recipientSources.includes(group.source))
    .reduce((sum, group) => sum + group.count, 0);

  const toggleSource = (source: RecipientSource) => {
    setRecipientSources((current) => {
      if (current.includes(source)) {
        const next = current.filter((item) => item !== source);
        return next.length > 0 ? next : current;
      }
      return [...current, source];
    });
  };

  const handleSave = async (sendAfterSave = false) => {
    if (!subject.trim() || !content.trim()) return;
    setSaving(true);
    setSending(sendAfterSave);
    setError('');
    try {
      const res = await fetch('/api/admin/newsletter/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: initial?.id, subject, html: content, recipientSources }),
      });

      if (res.ok) {
        const data = await res.json();
        const broadcastId = data.id || data.broadcast?.id || initial?.id;

        if (sendAfterSave) {
          if (!broadcastId) {
            setError('Brouillon enregistré, mais ID manquant pour l’envoi.');
            return;
          }

          const sendRes = await fetch('/api/admin/newsletter/broadcasts/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: broadcastId }),
          });
          const sendData = await sendRes.json();

          if (!sendRes.ok) {
            setError(sendData.error || 'Brouillon enregistré, mais envoi impossible.');
            return;
          }
        }

        router.push('/admin/newsletter/campagnes');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setSaving(false);
      setSending(false);
    }
  };

  const handleSchedule = async () => {
    setError('');
    try {
      const scheduledAt = reunionDateToIso(scheduledDate);
      if (Date.parse(scheduledAt) < Date.now() + 60000) throw new Error('Choisis une date au moins une minute dans le futur.');
      if (!confirm(`Planifier « ${subject} » pour le ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Indian/Reunion' }).format(new Date(scheduledAt))}, heure de La Réunion ? Les abonnés encore actifs au moment de l’envoi seront sélectionnés.`)) return;
      setScheduling(true);
      scheduleRequest.current ??= crypto.randomUUID();
      const response = await fetch('/api/admin/newsletter/schedules', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, html: content, scheduledAt, requestKey: scheduleRequest.current }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Planification impossible.');
      router.push('/admin/newsletter/planification'); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Connexion impossible. Réessaie sans modifier le formulaire.'); }
    finally { setScheduling(false); }
  };

  return (
    <div className="space-y-6">
      {/* Destinataires */}
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className="block text-sm font-semibold text-gray-700">
            Destinataires
          </label>
          {recipientGroups.length > 0 && (
            <span className="text-xs text-gray-400">
              Sélection actuelle : {selectedCount > 0 ? `${selectedCount}+ emails` : 'calcul en cours'}
            </span>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {recipientGroups.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-400 md:col-span-3">
              Chargement des listes...
            </div>
          ) : (
            recipientGroups.map((group) => {
              const checked = recipientSources.includes(group.source);
              return (
                <button
                  key={group.source}
                  type="button"
                  onClick={() => toggleSource(group.source)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    checked
                      ? 'border-jungle-500 bg-jungle-50 ring-1 ring-jungle-100'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-ink">{group.label}</span>
                    <CheckSquare size={17} className={checked ? 'text-jungle-600' : 'text-gray-300'} />
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">{group.description}</span>
                  <span className="mt-3 inline-flex rounded-full bg-white px-2 py-1 text-xs font-bold text-gray-600 ring-1 ring-gray-200">
                    {group.count} email{group.count > 1 ? 's' : ''}
                  </span>
                </button>
              );
            })
          )}
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Les emails sélectionnés seront synchronisés dans l’audience Resend avant la création du brouillon.
        </p>
      </div>

      {/* Objet */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Objet de l&apos;email
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => { setSubject(e.target.value); scheduleRequest.current = null; }}
          placeholder="Ex: Nouveautés Island Dreams — Été 2026"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500 outline-none"
        />
      </div>

      {/* Contenu */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Contenu HTML
          </label>
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-jungle-600 transition-colors"
          >
            {preview ? <EyeOff size={14} /> : <Eye size={14} />}
            {preview ? 'Éditer' : 'Aperçu'}
          </button>
        </div>

        {preview ? (
          <div
            className="border border-gray-200 rounded-lg p-6 min-h-[300px] prose prose-sm max-w-none bg-white"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); scheduleRequest.current = null; }}
            rows={16}
            placeholder={`<h2>Titre de votre campagne</h2>\n<p>Votre contenu ici...</p>\n<a href="https://www.islanddreams.re/boutique">Voir la boutique →</a>`}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500 outline-none resize-y"
          />
        )}
        <p className="text-xs text-gray-400 mt-1">
          Vérifie les images et les liens avec l’aperçu avant l’envoi. Un lien de désinscription est ajouté aux campagnes planifiées.
        </p>
      </div>

      <section className="rounded-xl border border-jungle-200 bg-jungle-50 p-5 space-y-3">
        <h2 className="flex items-center gap-2 font-bold text-jungle-800"><CalendarClock size={18} /> Planifier un envoi automatique</h2>
        <p className="text-sm text-gray-600">Prépare ton contenu maintenant et choisis son heure d’envoi à La Réunion (UTC+4). L’envoi planifié utilise uniquement les abonnés newsletter encore actifs. Le contenu est figé après validation.</p>
        <label htmlFor="newsletter-scheduled-date" className="block text-sm font-semibold">Date et heure à La Réunion</label>
        <input id="newsletter-scheduled-date" type="datetime-local" value={scheduledDate} onChange={e => { setScheduledDate(e.target.value); scheduleRequest.current = null; }} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" />
        <button type="button" onClick={() => void handleSchedule()} disabled={scheduling || saving || !scheduledDate || !subject.trim() || !content.trim() || recipientSources.length !== 1 || recipientSources[0] !== 'newsletter'} className="flex items-center gap-2 rounded-lg bg-jungle-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {scheduling ? <Loader2 size={16} className="animate-spin" /> : <CalendarClock size={16} />} {scheduling ? 'Planification…' : 'Valider la planification'}
        </button>
        {(recipientSources.length !== 1 || recipientSources[0] !== 'newsletter') && <p className="text-sm text-amber-800">Sélectionne uniquement « Abonnés newsletter » pour planifier un envoi.</p>}
      </section>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => handleSave(false)}
          disabled={saving || scheduling || !subject.trim() || !content.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-jungle-600 text-white rounded-lg text-sm font-semibold hover:bg-jungle-700 transition-colors disabled:opacity-50"
        >
          {saving && !sending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving && !sending ? 'Enregistrement…' : 'Enregistrer le brouillon'}
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving || scheduling || !subject.trim() || !content.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-coral-500 text-white rounded-lg text-sm font-semibold hover:bg-coral-600 transition-colors disabled:opacity-50"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {sending ? 'Envoi…' : 'Enregistrer et envoyer'}
        </button>
        <button
          onClick={() => router.push('/admin/newsletter/campagnes')}
          className="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
