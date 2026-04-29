import Image from 'next/image';

export function HeroAPropos() {
  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] w-full overflow-hidden flex items-end">
      <Image
        src="/images/hero/hero3.png"
        alt="Île de La Réunion"
        fill
        priority
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-jungle-900/85 via-jungle-900/30 to-transparent" />

      <div className="relative z-10 w-full text-center px-4 pb-16 md:pb-24">
        <p className="text-sun-300 text-xs md:text-sm uppercase tracking-[0.35em] font-semibold mb-3">
          Island Dreams · 974
        </p>
        <h1 className="title-chunky-light text-[3rem] leading-[0.9] md:text-7xl lg:text-8xl">
          NOUT
          <br />
          ZISTOIR
        </h1>
        <p className="mt-4 text-cream/80 text-base md:text-xl italic font-light">
          Une aventure péi, un souvenir à la fois.
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-cream/60 animate-bounce">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 7l6 6 6-6M6 13l6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
