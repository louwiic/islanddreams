'use client';

import { useRouter } from 'next/navigation';
import { Trash2, Send } from 'lucide-react';
import { useState } from 'react';

export function DeleteCampaignButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await fetch('/api/admin/newsletter/campaigns/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-500 font-semibold">Supprimer ?</span>
        <button onClick={handleDelete} disabled={loading} className="text-xs font-bold text-red-600 hover:text-red-700 disabled:opacity-50">
          {loading ? '…' : 'Oui'}
        </button>
        <button onClick={() => setConfirming(false)} className="text-xs text-gray-400 hover:text-gray-600">
          Non
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
    >
      <Trash2 size={12} />
      Supprimer
    </button>
  );
}

export function SendCampaignButton({ id, activeCount }: { id: string; activeCount: number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSend = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/newsletter/campaigns/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();

    if (res.ok) {
      setResult(`Envoyé à ${data.sent} abonné${data.sent > 1 ? 's' : ''}`);
      setTimeout(() => router.refresh(), 2000);
    } else {
      setResult(data.error || 'Erreur');
      setLoading(false);
    }
  };

  if (result) {
    return <span className="text-xs font-semibold text-jungle-600">{result}</span>;
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-orange-600 font-semibold">
          Envoyer à {activeCount} abonné{activeCount > 1 ? 's' : ''} ?
        </span>
        <button onClick={handleSend} disabled={loading} className="text-xs font-bold text-jungle-600 hover:text-jungle-700 disabled:opacity-50">
          {loading ? 'Envoi…' : 'Confirmer'}
        </button>
        <button onClick={() => setConfirming(false)} className="text-xs text-gray-400 hover:text-gray-600">
          Annuler
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1 text-xs font-semibold text-jungle-600 hover:text-jungle-700 transition-colors"
    >
      <Send size={12} />
      Envoyer
    </button>
  );
}
