import Image from 'next/image';

type Props = {
  src: string;
  alt: string;
  className?: string;
};

/**
 * Encadrement "timbre-poste" : fond crème, perforations sur les 4 bords,
 * image portrait forcé (ratio 3/4) avec object-cover.
 */
export function StampFrame({ src, alt, className = '' }: Props) {
  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{
        background: '#f0e8d5',
        padding: '14px',
        // Perforations sur les 4 bords (demi-cercles découpés)
        WebkitMaskImage: [
          'radial-gradient(circle at 12px 0,    transparent 10px, #000 10px) top    / 24px 12px repeat-x',
          'radial-gradient(circle at 12px 24px, transparent 10px, #000 10px) bottom / 24px 12px repeat-x',
          'radial-gradient(circle at 0    12px, transparent 10px, #000 10px) left   / 12px 24px repeat-y',
          'radial-gradient(circle at 24px 12px, transparent 10px, #000 10px) right  / 12px 24px repeat-y',
        ].join(', '),
        maskImage: [
          'radial-gradient(circle at 12px 0,    transparent 10px, #000 10px) top    / 24px 12px repeat-x',
          'radial-gradient(circle at 12px 24px, transparent 10px, #000 10px) bottom / 24px 12px repeat-x',
          'radial-gradient(circle at 0    12px, transparent 10px, #000 10px) left   / 12px 24px repeat-y',
          'radial-gradient(circle at 24px 12px, transparent 10px, #000 10px) right  / 12px 24px repeat-y',
        ].join(', '),
        filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.35))',
        borderRadius: '4px',
      }}
    >
      {/* Image portrait 3/4 */}
      <div className="relative w-full" style={{ aspectRatio: '3/4', overflow: 'hidden' }}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 80vw, 280px"
        />
      </div>
    </div>
  );
}
