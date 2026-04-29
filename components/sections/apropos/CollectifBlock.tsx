const ETAPES = [
  { icon: '✏️', label: 'Dessiné', detail: 'à La Réunion' },
  { icon: '🖨️', label: 'Imprimé', detail: 'par des artisans péi' },
  { icon: '📦', label: 'Expédié', detail: 'depuis La Réunion' },
];

export function CollectifBlock() {
  return (
    <section className="bg-jungle-50 py-20 md:py-28 px-4">
      <div className="max-w-4xl mx-auto text-center">

        <p className="text-jungle-600 text-xs uppercase tracking-[0.3em] font-bold mb-4">
          Le collectif local
        </p>
        <h2 className="title-chunky-light text-3xl md:text-5xl mb-6">
          FAIT ICI,
          <br />
          AVEC FIERTÉ
        </h2>
        <p className="text-ink/60 text-base md:text-lg italic mb-14 max-w-xl mx-auto">
          Graphiste, imprimeur, développeur web — chaque maillon de la chaîne Island Dreams est réunionnais.
        </p>

        <div className="grid grid-cols-3 gap-6 md:gap-10 max-w-2xl mx-auto mb-14">
          {ETAPES.map(({ icon, label, detail }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white shadow-md border border-jungle-100 flex items-center justify-center text-3xl md:text-4xl">
                {icon}
              </div>
              <p className="font-black text-ink text-sm md:text-base">{label}</p>
              <p className="text-ink/45 text-xs">{detail}</p>
            </div>
          ))}
        </div>

        {/* Mention FEDER */}
        <p className="text-ink/35 text-[10px] md:text-xs max-w-md mx-auto leading-relaxed">
          Ce site a été financé par l'Union Européenne dans le cadre du programme FEDER-FSE+ La Réunion,
          la Région Réunion en étant l'autorité de gestion.
        </p>

      </div>
    </section>
  );
}
