'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

export function TextileActions({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);

  const toggle = async () => {
    await fetch('/api/admin/textile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !isActive }),
    });
    router.refresh();
  };

  const handleDelete = async () => {
    await fetch('/api/admin/textile', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    router.refresh();
    setConfirm(false);
  };

  if (confirm) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={handleDelete} className="px-2 py-1 text-[11px] font-bold text-white bg-red-500 rounded-md hover:bg-red-600">
          Oui
        </button>
        <button onClick={() => setConfirm(false)} className="px-2 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200">
          Non
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button onClick={toggle} className="p-1.5 text-gray-400 hover:text-ink rounded-lg hover:bg-gray-50" title={isActive ? 'Désactiver' : 'Activer'}>
        {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>
      <button onClick={() => setConfirm(true)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50" title="Supprimer">
        <Trash2 size={14} />
      </button>
    </div>
  );
}
