import Image from 'next/image';

export function ServiettePlage() {
  return (
    <section
      id="serviette-section"
      className="relative w-full overflow-hidden flex flex-col items-center justify-start"
      style={{ minHeight: '100vh' }}
    >
      {/* BG plage */}
      <Image src="/images/sections/plage-bg.png" alt="" fill className="object-cover object-center" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />

      {/* Contenu */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 pt-12 md:pt-20 pb-6 w-full max-w-5xl mx-auto">

        {/* Titre */}
        <div className="text-center">
          <h2 className="title-chunky-light text-4xl md:text-6xl lg:text-7xl">
            L&apos;ÎLE SOUS LES PIEDS
          </h2>
          <p className="mt-2 text-cream/90 text-base md:text-lg italic font-light drop-shadow">
            La serviette microfibre qui ramène la plage péi partout avec toi.
          </p>
        </div>

        {/* Flash magique */}
        <div
          id="serviette-flash"
          className="absolute pointer-events-none opacity-0"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,30,0.95) 0%, rgba(255,140,0,0.5) 40%, transparent 70%)',
            width: 320, height: 320,
            top: '45%', left: '50%',
            transform: 'translate(-50%,-50%)',
            zIndex: 20,
          }}
          aria-hidden
        />

        {/* ── Zone centrale : fille OU cards (même espace) ── */}
        <div className="relative flex items-center justify-center w-full" style={{ minHeight: '55vh' }}>

          {/* Femme + serviette — centrée */}
          <div
            id="serviette-reveal"
            className="relative w-[320px] md:w-[500px] lg:w-[600px] opacity-0 z-10"
          >
            <Image
              src="/images/products/textile/serviette-plage.png"
              alt="Tapis de plage Island Dreams"
              width={1024} height={1024}
              className="w-full h-auto drop-shadow-2xl"
              unoptimized
            />
          </div>

          {/* Bulle — style FridgeCollection (rect arrondi + queue gauche) */}
          <div
            id="serviette-bubble"
            className="absolute opacity-0 pointer-events-none z-20"
            style={{ left: '56%', top: '8%' }}
            aria-hidden
          >
            <div className="relative bg-white rounded-2xl px-4 py-3 md:px-6 md:py-4 shadow-xl border-2 border-ink max-w-[160px] md:max-w-[220px]">
              {/* Message 1 */}
              <p
                id="bubble-msg-1"
                className="text-ink font-bold text-[12px] md:text-sm leading-snug text-center"
              >
                Attend, on a quelque chose pour toi&nbsp;!
              </p>
              {/* Message 2 — par-dessus, caché */}
              <p
                id="bubble-msg-2"
                className="absolute inset-0 flex items-center justify-center text-ink font-bold text-[12px] md:text-sm leading-snug text-center opacity-0 px-4"
              >
                Découvre nos articles pour aller à la playa&nbsp;😍
              </p>
              {/* Queue gauche — carré rotaté 45° (même que FridgeCollection) */}
              <div
                className="absolute top-1/2 -left-3 -translate-y-1/2 w-5 h-5 bg-white border-b-2 border-l-2 border-ink"
                style={{ transform: 'translateY(-50%) rotate(45deg)' }}
              />
            </div>
          </div>

          {/* Cards — même position que la fille, cachées, popent à sa place */}
          <div
            className="absolute inset-0 flex items-center justify-center gap-3 md:gap-5 px-2"
            aria-hidden="false"
          >
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                id={`textile-card-${n}`}
                className="opacity-0 flex-1 max-w-[180px] md:max-w-[240px] lg:max-w-[280px]"
              >
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src={`/images/sections/textile-${n}.png`}
                    alt={`Article plage ${n}`}
                    width={800} height={800}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
