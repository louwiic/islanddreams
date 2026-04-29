'use client';

import { useRouter } from 'next/navigation';
import { CheckCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function MarkReadButton({ id }: { id: string }) {
  const router = useRouter();

  const mark = async () => {
    await fetch('/api/admin/messages/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  };

  return (
    <button
      onClick={mark}
      className="flex items-center gap-1 text-xs text-gray-400 hover:text-jungle-600 transition-colors"
    >
      <CheckCheck size={12} />
      Marquer comme lu
    </button>
  );
}

export function DeleteMessageButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await fetch('/api/admin/messages/delete', {
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
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-bold text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          {loading ? '…' : 'Oui'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Non
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1 text-xs text-gray-300 hover:text-red-500 transition-colors"
    >
      <Trash2 size={12} />
      Supprimer
    </button>
  );
}
