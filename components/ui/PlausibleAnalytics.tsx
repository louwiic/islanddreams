'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/analytics/plausible';

export function PlausibleAnalytics() {
  const pathname = usePathname();
  const lastPage = useRef<string | null>(null);

  useEffect(() => {
    if (lastPage.current === pathname) return;
    lastPage.current = track('pageview') ? pathname : null;
  }, [pathname]);

  return null;
}
