'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

export function ToggleBannerButton({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    await fetch('/api/admin/banners/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !isActive }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="p-2 text-gray-400 hover:text-ink rounded-lg hover:bg-gray-50 transition-colors"
      title={isActive ? 'Désactiver' : 'Activer'}
    >
      {isActive ? <Eye size={16} /> : <EyeOff size={16} />}
    </button>
  );
}

export function DeleteBannerButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);

  const handleDelete = async () => {
    await fetch('/api/admin/banners/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    router.refresh();
    setConfirm(false);
  };

  if (confirm) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          className="px-2 py-1 text-[11px] font-bold text-white bg-red-500 rounded-md hover:bg-red-600"
        >
          Oui
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="px-2 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Non
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
      title="Supprimer"
    >
      <Trash2 size={16} />
    </button>
  );
}
