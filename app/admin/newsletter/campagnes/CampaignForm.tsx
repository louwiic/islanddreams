'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckSquare, Eye, EyeOff, Loader2, Save } from 'lucide-react';

type Props = {
  initial?: { id: string; name: string };
};

type RecipientSource = 'newsletter' | 'contacts' | 'contest';

type RecipientGroup = {
  source: RecipientSource;
  label: string;
  description: string;
  count: number;
  preview: string[];
};

const defaultSubject = 'Fête des pères : un cadeau offert dès 25 € d’achat';

const defaultNewsletterHtml = `<div style="font-family:Arial,sans-serif;color:#1a2e3b;line-height:1.6;">
  <p style="margin:0 0 10px;color:#c7483c;font-weight:bold;text-transform:uppercase;letter-spacing:.08em;">En ce moment</p>
  <h1 style="margin:0 0 12px;font-size:28px;line-height:1.15;color:#173f46;">Un cadeau offert pour la fête des pères</h1>
  <p style="margin:0 0 18px;font-size:16px;color:#4f5f68;">
    À l’occasion de la fête des pères, Island Dreams glisse un petit souvenir péi dans votre commande.
  </p>

  <div style="margin:22px 0;padding:18px;border-radius:18px;background:#f8efe0;border:1px solid #f4d276;">
    <img src="REMPLACER_PAR_URL_IMAGE_DU_CADEAU" alt="Cadeau offert Island Dreams" style="display:block;width:100%;max-width:420px;margin:0 auto 16px;border-radius:14px;">
    <h2 style="margin:0 0 8px;font-size:22px;color:#173f46;">Un porte-clés Island Dreams offert</h2>
    <p style="margin:0;color:#4f5f68;">
      Dès <strong>25 € d’achat</strong>, recevez automatiquement un cadeau offert dans votre commande.
      Aucun code nécessaire, il sera ajouté si le montant minimum est atteint.
    </p>
  </div>

  <p style="margin:0 0 18px;color:#4f5f68;">
    Magnets, stickers, déco ou souvenirs 974 : c’est le bon moment pour faire plaisir à un papa qui aime La Réunion.
  </p>

  <a href="https://www.islanddreams.re/boutique" style="display:inline-block;background:#173f46;color:#fff;text-decoration:none;padding:13px 22px;border-radius:999px;font-weight:bold;">
    Découvrir la boutique
  </a>

  <p style="margin:18px 0 0;font-size:12px;color:#7b8790;">
    Offre valable selon stock disponible. Expédié en moins de 48h par Island Dreams, puis acheminement assuré par La Poste.
  </p>
</div>`;

export function CampaignForm({ initial }: Props) {
  const router = useRouter();
  const [subject, setSubject] = useState(initial?.name ?? defaultSubject);
  const [content, setContent] = useState(defaultNewsletterHtml);
  const [recipientSources, setRecipientSources] = useState<RecipientSource[]>(['newsletter']);
  const [recipientGroups, setRecipientGroups] = useState<RecipientGroup[]>([]);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  const handleSave = async () => {
    if (!subject.trim() || !content.trim()) return;
    setSaving(true);
    setError('');
    try {
      // Si édition : supprimer l'ancien brouillon puis recréer
      if (initial?.id) {
        await fetch('/api/admin/newsletter/broadcasts', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: initial.id }),
        });
      }

      const res = await fetch('/api/admin/newsletter/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, html: content, recipientSources }),
      });

      if (res.ok) {
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
    }
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
          onChange={(e) => setSubject(e.target.value)}
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
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            placeholder={`<h2>Titre de votre campagne</h2>\n<p>Votre contenu ici...</p>\n<a href="https://www.islanddreams.re/boutique">Voir la boutique →</a>`}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500 outline-none resize-y"
          />
        )}
        <p className="text-xs text-gray-400 mt-1">
          Remplace <code>REMPLACER_PAR_URL_IMAGE_DU_CADEAU</code> par l’URL de l’image du porte-clés avant l’envoi.
          Resend ajoute automatiquement le lien de désinscription en pied de mail.
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving || !subject.trim() || !content.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-jungle-600 text-white rounded-lg text-sm font-semibold hover:bg-jungle-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Enregistrement…' : 'Enregistrer le brouillon'}
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
