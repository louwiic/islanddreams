'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import gsap from 'gsap';

type CommuneDot = {
  id: string;
  name: string;
  x: number;
  y: number;
  labelSide: 'left' | 'right';
};

// Images magnets ronds par commune (Supabase Storage)
const MAGNETS_BASE = 'https://sgxilglkeupxpnzkzqfq.supabase.co/storage/v1/object/public/product-images/magnets-rond';

function getMagnetUrl(communeId: string): string {
  return `${MAGNETS_BASE}/${communeId}.webp`;
}

const COMMUNES: CommuneDot[] = [
  { id: 'saint-denis',          name: 'Saint-Denis',          x: 40.3, y: 18.6, labelSide: 'left'  },
  { id: 'sainte-marie',         name: 'Sainte-Marie',         x: 48,   y: 21.2, labelSide: 'left'  },
  { id: 'sainte-suzanne',       name: 'Sainte-Suzanne',       x: 51.4, y: 23.3, labelSide: 'right' },
  { id: 'le-port',              name: 'Le Port',              x: 29.7, y: 24.8, labelSide: 'left'  },
  { id: 'la-possession',        name: 'La Possession',        x: 32,   y: 24.4, labelSide: 'right' },
  { id: 'mafate',               name: 'Mafate',               x: 41.1, y: 26.7, labelSide: 'right' },
  { id: 'saint-andre',          name: 'Sainte-André',         x: 54.6, y: 26.9, labelSide: 'right' },
  { id: 'salazie',              name: 'Salazie',              x: 46.1, y: 33.1, labelSide: 'right' },
  { id: 'bras-panon',           name: 'Bras-Panon',           x: 55.4, y: 34.3, labelSide: 'right' },
  { id: 'saint-paul',           name: 'Saint-Paul',           x: 28.4, y: 37.6, labelSide: 'left'  },
  { id: 'saint-gilles',         name: 'Saint-Gilles',         x: 29.7, y: 42.7, labelSide: 'left'  },
  { id: 'saint-benoit',         name: 'Saint-Benoît',         x: 58,   y: 40,   labelSide: 'right' },
  { id: 'sainte-anne',          name: 'Sainte-Anne',          x: 61.2, y: 44.4, labelSide: 'right' },
  { id: 'les-trois-bassins',    name: 'Trois-Bassins',        x: 31.2, y: 50.4, labelSide: 'left'  },
  { id: 'plaine-des-palmistes', name: 'Plaine des Palmistes', x: 51.4, y: 49.1, labelSide: 'right' },
  { id: 'sainte-rose',          name: 'Sainte-Rose',          x: 65,   y: 52.3, labelSide: 'right' },
  { id: 'saint-leu',            name: 'Saint-Leu',            x: 29.5, y: 57.9, labelSide: 'left'  },
  { id: 'cilaos',               name: 'Cilaos',               x: 42.3, y: 54.6, labelSide: 'right' },
  { id: 'les-avirons',          name: 'Les Avirons',          x: 32.8, y: 61.8, labelSide: 'left'  },
  { id: 'entre-deux',           name: 'Entre-Deux',           x: 41.2, y: 65.5, labelSide: 'right' },
  { id: 'etang-sale',           name: 'Étang-Salé',           x: 32,   y: 66,   labelSide: 'left'  },
  { id: 'le-tampon',            name: 'Le Tampon',            x: 44.4, y: 70.6, labelSide: 'right' },
  { id: 'saint-louis',          name: 'Saint-Louis',          x: 37.4, y: 72.9, labelSide: 'left'  },
  { id: 'saint-pierre',         name: 'Saint-Pierre',         x: 43,   y: 78.9, labelSide: 'left'  },
  { id: 'petite-ile',           name: 'Petite-Île',           x: 47.9, y: 79.7, labelSide: 'right' },
  { id: 'saint-joseph',         name: 'Saint-Joseph',         x: 52.3, y: 82.8, labelSide: 'right' },
  { id: 'saint-philippe',       name: 'Saint-Philippe',       x: 61.7, y: 81.2, labelSide: 'right' },
];

type CommuneData = {
  id: string;
  name: string;
  description: string;
  postalCode: string;
};

type Props = {
  onSelect: (id: string) => void;
  activeId: string | null;
  activeCommune?: CommuneData | null;
};

export function CarteInteractive({ onSelect, activeId, activeCommune }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelImgRef = useRef<HTMLDivElement>(null);
  const flyingRef = useRef<HTMLDivElement>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [showPanelImage, setShowPanelImage] = useState(false);
  const [panelCommune, setPanelCommune] = useState<CommuneData | null>(null);

  const animateMagnet = useCallback((communeId: string, commune: CommuneData) => {
    const dot = COMMUNES.find(c => c.id === communeId);
    if (!dot || !containerRef.current || !flyingRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const startX = (dot.x / 100) * container.width;
    const startY = (dot.y / 100) * container.height;
    const endX = container.width - 180;
    const endY = container.height * 0.6;

    const el = flyingRef.current;
    const magnetUrl = getMagnetUrl(communeId);

    el.style.backgroundImage = `url(${magnetUrl})`;
    el.style.display = 'block';

    // Reset panel image
    setShowPanelImage(false);

    gsap.set(el, { x: startX - 40, y: startY - 40, scale: 0.3, opacity: 0, rotation: -15 });

    const tl = gsap.timeline({
      onComplete: () => {
        el.style.display = 'none';
        // Image apparaît en fondu dans le panneau une fois le magnet arrivé
        setShowPanelImage(true);
      }
    });

    tl.to(el, { opacity: 1, scale: 0.8, duration: 0.2, ease: 'back.out(2)' })
      .to(el, {
        x: endX - 40,
        y: endY - 40,
        scale: 1.3,
        rotation: 15,
        duration: 1,
        ease: 'power2.inOut',
      })
      .to(el, {
        scale: 1.0,
        rotation: 0,
        duration: 0.4,
        ease: 'bounce.out',
      })
      .to(el, { opacity: 0, duration: 0.3, ease: 'power2.in' });

    // Panneau apparaît avec léger délai
    setPanelCommune(commune);
    setTimeout(() => setShowPanel(true), 150);
  }, []);

  useEffect(() => {
    if (activeCommune && activeId) {
      animateMagnet(activeId, activeCommune);
    } else {
      setShowPanel(false);
      setShowPanelImage(false);
      setTimeout(() => setPanelCommune(null), 400);
    }
  }, [activeId, activeCommune, animateMagnet]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden min-h-[640px] md:min-h-0"
      style={{ aspectRatio: '1440 / 816' }}
    >
      {/* Fond océan */}
      <Image
        src="/images/map/fond-carte-reunion.jpg"
        alt=""
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      {/* Île illustrée */}
      <div className="absolute" style={{ left: '16%', top: '3%', width: '56%', height: '94%' }}>
        <Image
          src="/images/map/carte-reunion.webp"
          alt="Carte illustrée de La Réunion"
          fill
          className="object-contain"
          sizes="56vw"
          priority
        />
      </div>

      {/* Dots + labels */}
      {COMMUNES.map((commune) => {
        const isHovered   = hoveredId === commune.id;
        const isActive    = activeId  === commune.id;
        const isHighlight = isHovered || isActive;

        return (
          <button
            key={commune.id}
            onClick={(e) => { e.stopPropagation(); onSelect(commune.id); }}
            onMouseEnter={() => setHoveredId(commune.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${commune.x}%`, top: `${commune.y}%` }}
            aria-label={commune.name}
          >
            <span className="relative flex items-center justify-center">
              <span className="absolute inline-flex h-6 w-6 rounded-full bg-ink/50 animate-[ping_1.8s_ease-in-out_infinite]" />
              {isHighlight && (
                <span className="absolute inline-flex h-6 w-6 rounded-full bg-coral-400 opacity-50 animate-ping" />
              )}
              <span
                className={cn(
                  'relative block w-4 h-4 md:w-3.5 md:h-3.5 rounded-full border-2 border-white shadow-md transition-all duration-150',
                  isHighlight
                    ? 'bg-coral-500 border-coral-300 scale-125'
                    : 'bg-ink/80 group-hover:bg-coral-400 group-hover:scale-110'
                )}
              />
            </span>
            <span
              className={cn(
                'absolute top-1/2 -translate-y-1/2 text-[9px] md:text-sm font-bold text-ink whitespace-nowrap transition-colors',
                '[text-shadow:_-1px_-1px_0_#fff,_1px_-1px_0_#fff,_-1px_1px_0_#fff,_1px_1px_0_#fff,_0_0_6px_rgba(255,255,255,0.8)]',
                isHighlight && 'text-coral-600',
                commune.labelSide === 'left'
                  ? 'right-full mr-1.5'
                  : 'left-full ml-1.5'
              )}
            >
              {commune.name}
            </span>
          </button>
        );
      })}

      {/* Magnet volant (GSAP) */}
      <div
        ref={flyingRef}
        className="absolute z-40 w-20 h-20 rounded-full bg-cover bg-center pointer-events-none drop-shadow-xl"
        style={{ display: 'none' }}
      />

      {/* Panneau info — fond blur */}
      <div
        className={cn(
          'absolute right-4 top-4 bottom-4 w-[300px] md:w-[360px] z-30 transition-all duration-500 ease-out rounded-2xl overflow-hidden',
          showPanel ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
        )}
      >
        {/* Fond glassmorphism */}
        <div className="absolute inset-0 bg-jungle-900/75 backdrop-blur-xl rounded-2xl border border-white/10" />

        {panelCommune && (
          <div className="relative z-10 h-full flex flex-col p-6 md:p-8 overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl md:text-2xl font-black text-cream uppercase tracking-wide leading-tight">
                {panelCommune.name}
              </h3>
              <button
                onClick={(e) => { e.stopPropagation(); onSelect(''); }}
                className="text-cream/60 hover:text-cream transition-colors shrink-0 ml-3"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <span className="text-sun-400 text-[10px] font-bold uppercase tracking-widest mb-4">
              {panelCommune.postalCode} · La Réunion
            </span>

            {/* Description */}
            <p className="text-cream/80 text-xs md:text-sm leading-relaxed mb-5 text-justify">
              {panelCommune.description}
            </p>

            {/* Image magnet — apparaît en fondu après l'animation */}
            <div
              ref={panelImgRef}
              className={cn(
                'relative w-full aspect-square rounded-xl overflow-hidden mb-5 transition-all duration-700 ease-out',
                showPanelImage ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              )}
            >
              <Image
                src={getMagnetUrl(panelCommune.id)}
                alt={`Magnet ${panelCommune.name}`}
                fill
                className="object-contain p-2 drop-shadow-lg"
                sizes="360px"
              />
            </div>

            {/* CTA */}
            <a
              href={`/boutique?search=${encodeURIComponent(panelCommune.name)}`}
              className="block w-full py-3 bg-jungle-800/80 text-cream text-center text-xs font-bold uppercase tracking-wide rounded-xl hover:bg-jungle-800 transition-colors border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              Découvrez les produits de {panelCommune.name}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
