'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type Props = {
  faqs: FaqItem[];
  onChange: (faqs: FaqItem[]) => void;
};

let nextId = 0;
function uid() {
  return `faq-new-${Date.now()}-${nextId++}`;
}

export function FaqManager({ faqs, onChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const add = () => {
    const newFaq: FaqItem = { id: uid(), question: '', answer: '' };
    onChange([...faqs, newFaq]);
    setEditingId(newFaq.id);
  };

  const remove = (id: string) => {
    onChange(faqs.filter((f) => f.id !== id));
  };

  const updateFaq = (id: string, field: 'question' | 'answer', value: string) => {
    onChange(faqs.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...faqs];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  const moveDown = (index: number) => {
    if (index >= faqs.length - 1) return;
    const next = [...faqs];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {faqs.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">
          Aucune question — ajoutez des FAQ pour ce produit
        </p>
      )}

      {faqs.map((faq, index) => (
        <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Monter"
              >
                <GripVertical size={14} />
              </button>
            </div>
            <span className="text-xs font-medium text-gray-500 flex-1">
              Q{index + 1}
            </span>
            <button
              type="button"
              onClick={() => setEditingId(editingId === faq.id ? null : faq.id)}
              className="text-xs text-ocean-600 hover:text-ocean-700"
            >
              {editingId === faq.id ? 'Réduire' : 'Modifier'}
            </button>
            <button
              type="button"
              onClick={() => remove(faq.id)}
              className="p-1 text-gray-400 hover:text-coral-500 transition-colors"
              title="Supprimer"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {editingId === faq.id ? (
            <div className="p-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => updateFaq(faq.id, 'question', e.target.value)}
                  placeholder="Ex: Le produit est-il facile à transporter ?"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Réponse</label>
                <textarea
                  value={faq.answer}
                  onChange={(e) => updateFaq(faq.id, 'answer', e.target.value)}
                  rows={3}
                  placeholder="Réponse détaillée..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 resize-y"
                />
              </div>
            </div>
          ) : (
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-ink truncate">
                {faq.question || <span className="text-gray-400 italic">Question vide</span>}
              </p>
              {faq.answer && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">{faq.answer}</p>
              )}
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-jungle-400 hover:text-jungle-600 transition-colors"
      >
        <Plus size={16} />
        Ajouter une question
      </button>
    </div>
  );
}
