// Composant magnet réutilisable
// Affiche le vrai visuel du magnet depuis Supabase Storage

import Image from 'next/image';
import { clsx } from 'clsx';
import type { Commune } from '@/lib/data/communes';

type MagnetProps = {
  commune: Commune;
  size?: number;
  className?: string;
};

export function Magnet({ commune, size = 80, className }: MagnetProps) {
  return (
    <div
      className={clsx(
        'relative rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.2)] overflow-hidden',
        'border-2 border-white',
        className,
      )}
      style={{
        width: size,
        height: size,
      }}
    >
      <Image
        src={commune.image}
        alt={`Magnet ${commune.name}`}
        fill
        className="object-cover"
        sizes={`${size}px`}
      />
    </div>
  );
}
