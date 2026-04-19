// Composant magnet réutilisable
// Représente un magnet circulaire Island Dreams (style placeholder en attendant les vrais visuels)

import { clsx } from 'clsx';
import type { Commune } from '@/lib/data/communes';

type MagnetProps = {
  commune: Commune;
  size?: number; // diamètre en px
  className?: string;
};

export function Magnet({ commune, size = 80, className }: MagnetProps) {
  return (
    <div
      className={clsx(
        'relative rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]',
        'flex items-center justify-center',
        'border-2 border-white',
        className,
      )}
      style={{
        width: size,
        height: size,
        // Anneau extérieur subtil
        boxShadow:
          '0 4px 12px rgba(0,0,0,0.18), inset 0 0 0 3px var(--color-cream)',
      }}
    >
      {/* Cercle intérieur coloré */}
      <div
        className="absolute inset-[6px] rounded-full flex items-center justify-center"
        style={{ backgroundColor: commune.color }}
      >
        <span
          className="font-black text-white tabular-nums"
          style={{
            fontSize: size * 0.32,
            lineHeight: 1,
            textShadow: '2px 2px 0 rgba(0,0,0,0.18)',
          }}
        >
          {commune.postalCode}
        </span>
      </div>

      {/* Texte courbe en SVG sur l'anneau extérieur */}
      <svg
        className="absolute inset-0 pointer-events-none"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <defs>
          <path
            id={`circle-text-${commune.id}`}
            d="M 50, 50 m -42, 0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"
            fill="none"
          />
        </defs>
        <text
          fill="var(--color-ink)"
          fontSize="7"
          fontWeight="700"
          letterSpacing="1"
        >
          <textPath
            href={`#circle-text-${commune.id}`}
            startOffset="50%"
            textAnchor="middle"
          >
            ÎLE DE LA RÉUNION · ISLAND DREAMS
          </textPath>
        </text>
      </svg>
    </div>
  );
}
