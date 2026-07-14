'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function QrJourneyTracker() {
  const pathname = usePathname();
  useEffect(() => {
    fetch('/api/qr/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname]);
  return null;
}
