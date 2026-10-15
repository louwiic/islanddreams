'use client';

import { useEffect } from 'react';

export default function RefreshSession() {
  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get('next') || '/compte';
    const destination = next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : '/compte';
    const refresh = async () => {
      // Refresh tokens rotate once. Web Locks serializes requests across tabs,
      // while the server checks whether another tab already renewed it.
      const response = await fetch('/api/auth/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (response.ok) window.location.replace(destination);
      else window.location.replace('/compte/connexion?redirect=' + encodeURIComponent(destination));
    };
    void (navigator.locks ? navigator.locks.request('islanddreams-auth-refresh', refresh) : refresh()).catch(() => window.location.replace('/compte/connexion'));
  }, []);
  return <main className="min-h-screen grid place-items-center bg-cream text-ink"><p>Reconnexion en cours…</p></main>;
}
