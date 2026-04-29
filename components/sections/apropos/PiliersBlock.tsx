const PILIERS = [
  {
    titre: 'Identité péi',
    texte: 'Valoriser chaque commune dans sa singularité — ses couleurs, son histoire, sa fierté.',
    bg: 'bg-jungle-50',
    border: 'border-jungle-200',
    accent: 'text-jungle-700',
  },
  {
    titre: 'Éducatif',
    texte: 'Développer la connaissance géographique et culturelle de La Réunion, accessibles à tous.',
    bg: 'bg-sun-50',
    border: 'border-sun-200',
    accent: 'text-sun-600',
  },
  {
    titre: '100 % local',
    texte: 'Graphiste, imprimeur, développeur — chaque maillon de la chaîne est réunionnais.',
    bg: 'bg-coral-50',
    border: 'border-coral-200',
    accent: 'text-coral-600',
  },
];

export function PiliersBlock() {
  return (
    <section className="bg-cream py-20 md:py-28 px-4">
      <div className="max-w-5xl mx-auto">

        <p className="text-jungle-600 text-xs uppercase tracking-[0.3em] font-bold mb-4 text-center">
          Nos valeurs
        </p>
        <h2 className="title-chunky-light text-3xl md:text-5xl text-center mb-14">
          CE QUI NOUS
          <br />
          FAIT AVANCER
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILIERS.map(({ titre, texte, bg, border, accent }) => (
            <div
              key={titre}
              className={`${bg} border-2 ${border} rounded-3xl px-6 py-8 flex flex-col items-center text-center gap-4`}
            >
              {/* Image placeholder — à remplacer */}
              <div className="w-16 h-16 rounded-2xl bg-white/60 border border-ink/10" />
              <h3 className={`font-black text-xl ${accent}`}>{titre}</h3>
              <p className="text-ink/65 text-sm leading-relaxed">{texte}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
