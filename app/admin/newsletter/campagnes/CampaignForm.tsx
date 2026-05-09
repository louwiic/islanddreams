'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, EyeOff, Loader2 } from 'lucide-react';

type Props = {
  initial?: { id: string; name: string };
};

export function CampaignForm({ initial }: Props) {
  const router = useRouter();
  const [subject, setSubject] = useState(initial?.name ?? '');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
        body: JSON.stringify({ subject, html: content }),
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
