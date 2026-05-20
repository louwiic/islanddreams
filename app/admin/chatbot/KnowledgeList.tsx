'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, BookOpen, CheckCircle, Clock } from 'lucide-react';

type KnowledgeItem = { id: string; title: string; status: string; created_at: string };

export function KnowledgeList({ items }: { items: KnowledgeItem[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!title || !content) return;
    setSaving(true);
    await fetch('/api/admin/chatbot/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    setSaving(false);
    setTitle('');
    setContent('');
    setShowForm(false);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return;
    await fetch('/api/admin/chatbot/knowledge', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen size={18} className="text-ocean-600" />
          <div>
            <h2 className="font-semibold text-ink">Base de connaissance</h2>
            <p className="text-xs text-gray-500 mt-0.5">Articles utilisés par le chatbot pour répondre</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ocean-600 hover:bg-ocean-700 text-white text-xs font-medium rounded-lg transition-colors">
          <Plus size={14} /> Ajouter
        </button>
      </div>

      {showForm && (
        <div className="p-5 border-b border-gray-100 bg-gray-50 space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre (ex: Politique de livraison)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5}
            placeholder="Contenu de l'article — le chatbot s'en servira pour répondre aux questions..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 resize-y" />
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving || !title || !content}
              className="px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-ink transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="py-10 text-center text-gray-400 text-sm">
          Aucun article — ajoutez des informations sur vos produits, livraisons, CGV...
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3">
              {item.status === 'ready'
                ? <CheckCircle size={16} className="text-jungle-500 shrink-0" />
                : <Clock size={16} className="text-gray-300 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">{item.status === 'ready' ? 'Indexé' : 'En attente'}</p>
              </div>
              <button onClick={() => handleDelete(item.id)}
                className="p-1.5 text-gray-400 hover:text-coral-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
