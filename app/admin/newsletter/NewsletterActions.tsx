'use client';

import { useRouter } from 'next/navigation';
import { Trash2, Download } from 'lucide-react';
import { useState } from 'react';

export function DeleteSubscriberButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await fetch('/api/admin/newsletter', {
      method: 'DELETE',
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
    </button>
  );
}

export function ExportCsvButton() {
  return (
    <a
      href="/api/admin/newsletter/export"
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <Download size={16} />
      Export CSV
    </a>
  );
}
