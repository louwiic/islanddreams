'use client';

import Link from 'next/link';
import { track } from '@vercel/analytics/react';

type Props = {
  href: string;
  eventName: string;
  eventProps?: Record<string, string | number | boolean | null>;
  className?: string;
  ariaLabel?: string;
  children: React.ReactNode;
};

export function TrackedEventLink({
  href,
  eventName,
  eventProps,
  className,
  ariaLabel,
  children,
}: Props) {
  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={() =>
        track(eventName, {
          destination: href,
          ...eventProps,
        })
      }
    >
      {children}
    </Link>
  );
}
