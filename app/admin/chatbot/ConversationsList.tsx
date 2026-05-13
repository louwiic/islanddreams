'use client';

import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

type Conversation = {
  id: string;
  first_message: string;
  message_count: number;
  status: string;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function ConversationsList({ items }: { items: Conversation[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, 10);

  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <MessageSquare size={18} className="text-ocean-600" />
        <div>
          <h2 className="font-semibold text-ink">Conversations</h2>
          <p className="text-xs text-gray-500 mt-0.5">{items.length} conversation{items.length !== 1 ? 's' : ''} enregistrée{items.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-10 text-center text-gray-400 text-sm">
          Aucune conversation pour l&apos;instant
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-50">
            {visible.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink truncate">{item.first_message || '—'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.created_at)} · {item.message_count} message{item.message_count !== 1 ? 's' : ''}</p>
                </div>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${item.status === 'active' ? 'bg-jungle-50 text-jungle-700' : 'bg-gray-100 text-gray-500'}`}>
                  {item.status === 'active' ? 'Active' : item.status}
                </span>
              </div>
            ))}
          </div>
          {items.length > 10 && (
            <div className="px-5 py-3 border-t border-gray-50">
              <button onClick={() => setExpanded(!expanded)} className="text-xs text-ocean-600 hover:text-ocean-700 flex items-center gap-1">
                {expanded ? <><ChevronUp size={12} /> Voir moins</> : <><ChevronDown size={12} /> Voir les {items.length - 10} autres</>}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
