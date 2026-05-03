import Image from 'next/image';
import Link from 'next/link';

const COMMUNES = ['400', '410', '413', '420', '430', '440', '442', '450', '460', '470', '480', '490'];

/** Images personnage par bloc (null = petit dot classique) */
const STEP_CHARACTERS: (string | null)[] = [
  '/images/sections/apropos/1.png',
  '/images/sections/apropos/2.png',
  '/images/sections/apropos/3.png',
  '/images/sections/apropos/4.png',
  null,
  null,
];

const STEP_COLORS = [
  'bg-jungle-700',
  'bg-coral-500',
  'bg-jungle-600',
  'bg-sun-500',
  'bg-ocean-500',
  'bg-jungle-700',
];

function TimelineDot({ index }: { index: number }) {
  const image = STEP_CHARACTERS[index];
  const color = STEP_COLORS[index];

  if (!image) {
    // Petit dot classique
    return (
      <div className={`timeline-dot absolute left-6 md:left-1/2 w-4 h-4 rounded-full ${color} border-4 border-cream -translate-x-1/2 z-10 shadow`} />
    );
  }

  // Grand cercle avec personnage
  return (
    <div
      className={`timeline-dot timeline-char absolute left-6 md:left-1/2 -translate-x-1/2 z-10 w-14 h-14 md:w-16 md:h-16 rounded-full ${color} border-4 border-cream shadow-lg`}
    >
      <Image
        src={image}
        alt=""
        width={100}
        height={100}
        className="w-full h-full object-contain drop-shadow-[0_0_2px_rgba(255,255,255,0.8)] p-0.5"
        aria-hidden
      />
    </div>
  );
}

export function TimelineAPropos() {
  return (
    <main className="bg-cream">

      {/* ═══════════════════════════════════════════════════════════════
          HERO — "Nou va rakont azot nout zistoir"
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[70vh] md:min-h-[80vh] w-full overflow-hidden flex items-center justify-center">
        <Image
          src="/images/hero/hero3.png"
          alt="Île de La Réunion"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/20" />

        <div id="apropos-hero-text" className="relative z-10 text-center px-4">
          <p className="text-sun-300 text-xs md:text-sm uppercase tracking-[0.35em] font-semibold mb-4">
            Island Dreams · 974
          </p>
          <h1 className="apropos-title title-chunky-light text-[2.5rem] leading-[0.95] md:text-7xl lg:text-8xl mb-6">
            NOU VA RAKONT
            <br />
            AZOT NOUT ZISTOIR
          </h1>
          <p className="text-cream/70 text-base md:text-xl italic font-light max-w-lg mx-auto">
            On va vous raconter notre histoire, un souvenir à la fois.
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-cream/50 animate-bounce">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TIMELINE CONTAINER
      ═══════════════════════════════════════════════════════════════ */}
      <div id="timeline-container" className="relative max-w-4xl mx-auto px-4 py-20 md:py-32">

        {/* Ligne verticale centrale */}
        <div
          id="timeline-line"
          className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-jungle-200 md:-translate-x-1/2"
        />
        {/* Ligne animée qui se trace au scroll */}
        <div
          id="timeline-progress"
          className="absolute left-6 md:left-1/2 top-0 w-[2px] bg-jungle-600 md:-translate-x-1/2 origin-top"
          style={{ height: 0 }}
        />

        {/* ── Bloc 1 — Le déclic ────────────────────────────────────── */}
        <div className="timeline-block relative flex items-start gap-6 md:gap-0 mb-24 md:mb-32">
          <TimelineDot index={0} />

          {/* Contenu — gauche sur desktop */}
          <div className="ml-20 md:ml-0 md:w-1/2 md:pr-12 md:text-right">
            <span className="timeline-year inline-block px-3 py-1 bg-jungle-700 text-cream text-xs font-bold uppercase tracking-widest rounded-full mb-3">
              Le déclic
            </span>
            <h2 className="apropos-title title-chunky-light text-2xl md:text-4xl mb-2">
              TOUT LA KOMANSÉ
              <br />
              LA-BA
            </h2>
            <p className="text-ink/40 text-xs md:text-sm italic mb-4">Tout a commencé là-bas</p>
            <div className="space-y-4 text-ink/70 text-sm md:text-base leading-relaxed">
              <p>
                En voyageant en France métropolitaine, le constat était clair : impossible de trouver
                un souvenir qui représente vraiment <strong className="text-ink">sa ville natale réunionnaise</strong>.
              </p>
              <p>
                Les rayons regorgent de drapeaux régionaux répétés à l'infini, mais rien qui parle
                des communes, de leur identité propre, de ce qui les rend uniques.
              </p>
              <p>
                Ce vide, Rodophe Smith l'a ressenti comme une évidence : si ce produit n'existait pas,
                il fallait le créer.
              </p>
            </div>

            {/* Pull quote */}
            <blockquote id="apropos-quote" className="mt-8 border-l-4 md:border-l-0 md:border-r-4 border-sun-400 pl-5 md:pl-0 md:pr-5">
              <p className="text-ink text-lg md:text-xl font-bold italic leading-snug">
                "Presque aucun produit ne mettait en valeur l'identité des villes réunionnaises."
              </p>
            </blockquote>
          </div>
        </div>

        {/* ── Bloc 2 — L'idée ───────────────────────────────────────── */}
        <div className="timeline-block relative flex items-start gap-6 md:gap-0 mb-24 md:mb-32">
          <TimelineDot index={1} />

          {/* Contenu — droite sur desktop */}
          <div className="ml-20 md:ml-auto md:w-1/2 md:pl-12">
            <span className="timeline-year inline-block px-3 py-1 bg-coral-500 text-white text-xs font-bold uppercase tracking-widest rounded-full mb-3">
              L'idée
            </span>
            <h2 className="apropos-title title-chunky-light text-2xl md:text-4xl mb-2">
              3 CHIF,
              <br />
              IN LIDANTITÉ
            </h2>
            <p className="text-ink/40 text-xs md:text-sm italic mb-4">3 chiffres, une identité</p>
            <p className="text-ink/70 text-sm md:text-base leading-relaxed mb-6">
              Les derniers chiffres du code postal comme signature de chaque commune.
              Chaque visuel puise dans les éléments caractéristiques : culture locale, paysages,
              faune et flore endémiques, productions emblématiques.
            </p>

            {/* Badges communes */}
            <div id="apropos-magnets" className="flex flex-wrap gap-2.5 mb-8">
              {COMMUNES.map((code) => (
                <div
                  key={code}
                  className="magnet-badge w-11 h-11 md:w-13 md:h-13 rounded-full bg-sun-400 flex items-center justify-center shadow-md"
                >
                  <span className="font-black text-ink text-xs md:text-sm">{code}</span>
                </div>
              ))}
              <div className="magnet-badge w-11 h-11 md:w-13 md:h-13 rounded-full bg-coral-500 flex items-center justify-center shadow-md">
                <span className="font-black text-white text-[10px] md:text-xs">974</span>
              </div>
            </div>

            {/* Chiffres clés */}
            <div id="apropos-stats" className="grid grid-cols-3 gap-4">
              {[
                { value: 30, label: 'designs exclusifs', suffix: '' },
                { value: 28, label: 'communes', suffix: '' },
                { value: 2, label: 'ans de création', suffix: '' },
              ].map(({ value, label, suffix }) => (
                <div key={label} className="text-center">
                  <p className="stat-number title-chunky-light text-3xl md:text-4xl text-coral-500" data-target={value} data-suffix={suffix}>
                    0{suffix}
                  </p>
                  <p className="text-ink/45 text-[10px] md:text-xs mt-0.5 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bloc 3 — Le fondateur ─────────────────────────────────── */}
        <div className="timeline-block relative flex items-start gap-6 md:gap-0 mb-24 md:mb-32">
          <TimelineDot index={2} />

          <div className="ml-20 md:ml-0 md:w-1/2 md:pr-12 md:text-right">
            <span className="timeline-year inline-block px-3 py-1 bg-jungle-600 text-cream text-xs font-bold uppercase tracking-widest rounded-full mb-3">
              Le fondateur
            </span>
            <h2 className="apropos-title title-chunky-light text-2xl md:text-4xl mb-2">
              IN RÉYONÉ
              <br />
              DÉTÈRMINÉ
            </h2>
            <p className="text-ink/40 text-xs md:text-sm italic mb-6">Un Réunionnais déterminé</p>

            <div className="flex flex-col md:flex-row-reverse items-center gap-6 md:gap-8">
              <div className="shrink-0">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-sun-400 overflow-hidden shadow-xl">
                  <Image
                    src="/images/sections/fondateur.jpeg"
                    alt="Rodophe Smith — Fondateur Island Dreams"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-center font-bold text-ink text-sm mt-2">Rodophe Smith</p>
                <p className="text-center text-ink/40 text-xs">Fondateur</p>
              </div>

              <div className="flex-1 space-y-4">
                <blockquote className="text-ink text-lg md:text-xl font-bold italic leading-snug">
                  "Ce projet vient d'un parcours personnel, d'un lien profond et sensible avec La Réunion."
                </blockquote>
                <p className="text-ink/65 text-sm md:text-base leading-relaxed">
                  Entrepreneur réunionnais, Rodophe a ressenti le besoin de transmettre
                  <strong className="text-ink"> l'identité, la mémoire et la fierté</strong> de l'île
                  à travers des objets du quotidien.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bloc 4 — Les valeurs ──────────────────────────────────── */}
        <div className="timeline-block relative flex items-start gap-6 md:gap-0 mb-24 md:mb-32">
          <TimelineDot index={3} />

          <div className="ml-20 md:ml-auto md:w-1/2 md:pl-12">
            <span className="timeline-year inline-block px-3 py-1 bg-sun-500 text-ink text-xs font-bold uppercase tracking-widest rounded-full mb-3">
              Nout bann valèr
            </span>
            <h2 className="apropos-title title-chunky-light text-2xl md:text-4xl mb-2">
              SA KI FÉ NOU
              <br />
              AVANSÉ
            </h2>
            <p className="text-ink/40 text-xs md:text-sm italic mb-8">Ce qui nous fait avancer</p>

            <div className="space-y-4">
              {[
                {
                  titre: 'Identité péi',
                  texte: 'Valoriser chaque commune dans sa singularité — ses couleurs, son histoire, sa fierté.',
                  color: 'bg-jungle-600',
                },
                {
                  titre: 'Éducatif',
                  texte: 'Développer la connaissance géographique et culturelle de La Réunion, accessible à tous.',
                  color: 'bg-sun-400',
                },
                {
                  titre: '100 % local',
                  texte: 'Graphiste, imprimeur, développeur — chaque maillon de la chaîne est réunionnais.',
                  color: 'bg-coral-500',
                },
              ].map(({ titre, texte, color }) => (
                <div key={titre} className="timeline-card flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-ink/5">
                  <div className={`w-3 h-3 rounded-full ${color} mt-1.5 shrink-0`} />
                  <div>
                    <h3 className="font-black text-ink text-base mb-1">{titre}</h3>
                    <p className="text-ink/60 text-sm leading-relaxed">{texte}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bloc 5 — Fait ici ─────────────────────────────────────── */}
        <div className="timeline-block relative flex items-start gap-6 md:gap-0 mb-24 md:mb-32">
          <TimelineDot index={4} />

          <div className="ml-14 md:ml-0 md:w-1/2 md:pr-12 md:text-right">
            <span className="timeline-year inline-block px-3 py-1 bg-ocean-600 text-white text-xs font-bold uppercase tracking-widest rounded-full mb-3">
              Le collectif
            </span>
            <h2 className="apropos-title title-chunky-light text-2xl md:text-4xl mb-2">
              FÉ ISI,
              <br />
              ÈK FYÈRTÉ
            </h2>
            <p className="text-ink/40 text-xs md:text-sm italic mb-8">Fait ici, avec fierté</p>

            <div className="flex justify-center md:justify-end gap-8 md:gap-10 mb-8">
              {[
                { label: 'Dessiné', detail: 'à La Réunion' },
                { label: 'Imprimé', detail: 'par des artisans péi' },
                { label: 'Expédié', detail: 'depuis La Réunion' },
              ].map(({ label, detail }) => (
                <div key={label} className="timeline-card flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white shadow-md border border-ocean-100 flex items-center justify-center">
                    {/* Image à venir */}
                  </div>
                  <p className="font-black text-ink text-xs md:text-sm">{label}</p>
                  <p className="text-ink/40 text-[10px] md:text-xs">{detail}</p>
                </div>
              ))}
            </div>

            <p className="text-ink/35 text-[10px] md:text-xs max-w-sm mx-auto md:ml-auto md:mr-0 leading-relaxed">
              Ce site a été financé par l'Union Européenne dans le cadre du programme FEDER-FSE+ La Réunion,
              la Région Réunion en étant l'autorité de gestion.
            </p>
          </div>
        </div>

        {/* ── Bloc 6 — Aujourd'hui ──────────────────────────────────── */}
        <div className="timeline-block relative flex items-start gap-6 md:gap-0">
          <TimelineDot index={5} />

          <div className="ml-14 md:ml-auto md:w-1/2 md:pl-12">
            <span className="timeline-year inline-block px-3 py-1 bg-jungle-800 text-sun-300 text-xs font-bold uppercase tracking-widest rounded-full mb-3">
              Zordi
            </span>
            <h2 className="apropos-title title-chunky-light text-2xl md:text-4xl mb-2">
              É LAVANTUR
              <br />
              I KONTINUÉ
            </h2>
            <p className="text-ink/40 text-xs md:text-sm italic mb-4">Et l'aventure continue</p>
            <p className="text-ink/70 text-sm md:text-base leading-relaxed mb-6">
              Après deux ans de recherche et de création, la gamme Island Dreams couvre aujourd'hui
              les magnets, stickers, textiles, accessoires et objets décoratifs —
              dont une carte magnétique de La Réunion avec ses 28 magnets communes.
            </p>
            <p className="text-ink/70 text-sm md:text-base leading-relaxed">
              Une approche identitaire, visuelle et éducative.
              Un projet de médiation culturelle autant que commercial.
            </p>
          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CTA FINAL
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-jungle-800 py-20 md:py-28 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="title-chunky-light text-3xl md:text-5xl text-cream mb-2">
            PRAN
            <br />
            OUT SOUVNIR
          </h2>
          <p className="text-cream/40 text-xs md:text-sm italic mb-3">Prenez votre souvenir</p>
          <p className="text-cream/50 italic text-base md:text-lg mb-10">
            Zot vil, zot fiérté péi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/boutique"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-sun-400 hover:bg-sun-300 text-ink font-bold text-sm uppercase tracking-wider rounded-full shadow-lg transition-colors"
            >
              Découvrir la boutique
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-cream/40 text-cream hover:bg-cream/10 font-bold text-sm uppercase tracking-wider rounded-full transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
