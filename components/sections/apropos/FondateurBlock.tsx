export function FondateurBlock() {
  return (
    <section className="bg-ink py-20 md:py-32 px-4">
      <div className="max-w-4xl mx-auto">

        <p className="text-sun-300 text-xs uppercase tracking-[0.3em] font-bold mb-6 text-center">
          Le fondateur
        </p>

        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

          {/* Avatar placeholder — à remplacer par une photo */}
          <div className="shrink-0">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-jungle-700 border-4 border-sun-400 flex items-center justify-center overflow-hidden">
              <span className="text-6xl md:text-7xl select-none">🤙</span>
            </div>
            <p className="text-center text-cream font-bold mt-3 text-sm">Rodophe Smith</p>
            <p className="text-center text-cream/40 text-xs mt-0.5">Fondateur · Island Dreams</p>
          </div>

          {/* Texte */}
          <div className="flex-1 space-y-5">
            <blockquote className="text-cream text-xl md:text-2xl font-bold italic leading-snug">
              "Ce projet vient d'un parcours personnel, d'un lien profond et sensible avec La Réunion et son patrimoine."
            </blockquote>
            <p className="text-cream/65 text-base leading-relaxed">
              Entrepreneur réunionnais, Rodophe a ressenti le besoin de transmettre
              <strong className="text-cream"> l'identité, la mémoire et la fierté</strong> de l'île à travers
              des objets du quotidien. Un projet de médiation culturelle autant que commercial.
            </p>
            <p className="text-cream/65 text-base leading-relaxed">
              Après deux ans de recherche et de création, la gamme Island Dreams couvre aujourd'hui
              les magnets, stickers, textiles, accessoires et objets décoratifs —
              dont une carte magnétique de La Réunion avec ses 28 magnets communes.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
