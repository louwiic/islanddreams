'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  position: number;
  is_active: boolean;
};

export function FaqAdminList({ initialFaqs }: { initialFaqs: FaqItem[] }) {
  const router = useRouter();
  const [faqs, setFaqs] = useState(initialFaqs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const add = () => {
    const newFaq: FaqItem = {
      id: `new-${Date.now()}`,
      question: '',
      answer: '',
      position: faqs.length,
      is_active: true,
    };
    setFaqs([...faqs, newFaq]);
    setEditingId(newFaq.id);
  };

  const remove = (id: string) => {
    setFaqs(faqs.filter((f) => f.id !== id));
  };

  const updateFaq = (id: string, field: keyof FaqItem, value: string | boolean) => {
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...faqs];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setFaqs(next);
  };

  const moveDown = (index: number) => {
    if (index >= faqs.length - 1) return;
    const next = [...faqs];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setFaqs(next);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = faqs
      .filter((f) => f.question.trim() && f.answer.trim())
      .map((f, i) => ({
        question: f.question,
        answer: f.answer,
        position: i,
        is_active: f.is_active,
      }));

    await fetch('/api/admin/faq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faqs: payload }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {faqs.length === 0 && (
        <div className="py-10 text-center text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
          Aucune question — ajoutez des FAQ pour la page d&apos;accueil
        </div>
      )}

      {faqs.map((faq, index) => (
        <div key={faq.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col gap-0.5">
              <button type="button" onClick={() => moveUp(index)} disabled={index === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                <ChevronUp size={14} />
              </button>
              <button type="button" onClick={() => moveDown(index)} disabled={index === faqs.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                <ChevronDown size={14} />
              </button>
            </div>
            <span className="text-xs font-medium text-gray-500">Q{index + 1}</span>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => updateFaq(faq.id, 'is_active', !faq.is_active)}
              className={`p-1.5 rounded transition-colors ${faq.is_active ? 'text-jungle-600 hover:bg-jungle-50' : 'text-gray-300 hover:bg-gray-100'}`}
              title={faq.is_active ? 'Visible' : 'Masqué'}
            >
              {faq.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            <button
              type="button"
              onClick={() => setEditingId(editingId === faq.id ? null : faq.id)}
              className="text-xs text-ocean-600 hover:text-ocean-700 px-2"
            >
              {editingId === faq.id ? 'Réduire' : 'Modifier'}
            </button>
            <button type="button" onClick={() => remove(faq.id)} className="p-1.5 text-gray-400 hover:text-coral-500 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>

          {editingId === faq.id ? (
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => updateFaq(faq.id, 'question', e.target.value)}
                  placeholder="Ex: Quels sont les délais de livraison ?"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Réponse</label>
                <textarea
                  value={faq.answer}
                  onChange={(e) => updateFaq(faq.id, 'answer', e.target.value)}
                  rows={4}
                  placeholder="Réponse détaillée..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 resize-y"
                />
              </div>
            </div>
          ) : (
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-ink">{faq.question || <span className="text-gray-400 italic">Question vide</span>}</p>
              {faq.answer && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{faq.answer}</p>}
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-jungle-400 hover:text-jungle-600 transition-colors"
      >
        <Plus size={16} />
        Ajouter une question
      </button>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${saved ? 'bg-jungle-100 text-jungle-700' : 'bg-jungle-600 hover:bg-jungle-700 text-white'} disabled:opacity-50`}
      >
        <Save size={15} />
        {saved ? 'Enregistré !' : saving ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </div>
  );
}
