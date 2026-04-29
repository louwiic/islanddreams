const COMMUNES = ['400', '410', '413', '420', '430', '440', '442', '450', '460', '470', '480', '490'];

export function IdeeBlock() {
  return (
    <section className="bg-jungle-800 py-20 md:py-32 px-4 overflow-hidden">
      <div className="max-w-4xl mx-auto">

        {/* Label */}
        <p className="text-sun-300 text-xs uppercase tracking-[0.3em] font-bold mb-6 text-center">
          Le concept
        </p>

        <h2 className="title-chunky-light text-3xl md:text-5xl text-center text-cream mb-6">
          3 CHIFFRES,
          <br />
          UNE IDENTITÉ
        </h2>

        <p className="text-cream/70 text-center text-base md:text-lg italic mb-14 max-w-xl mx-auto">
          Les derniers chiffres du code postal comme signature de chaque commune.
        </p>

        {/* Grille de codes postaux animée */}
        <div className="flex flex-wrap justify-center gap-3 mb-14">
          {COMMUNES.map((code) => (
            <div
              key={code}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-sun-400 flex items-center justify-center shadow-lg"
            >
              <span className="font-black text-ink text-sm md:text-base">{code}</span>
            </div>
          ))}
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-coral-500 flex items-center justify-center shadow-lg">
            <span className="font-black text-white text-xs md:text-sm text-center leading-tight">974</span>
          </div>
        </div>

        {/* Chiffres clés */}
        <div className="grid grid-cols-3 gap-6 text-center">
          {[
            { value: '30', label: 'designs exclusifs' },
            { value: '28', label: 'communes représentées' },
            { value: '2 ans', label: 'de recherche & création' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="title-chunky-light text-4xl md:text-6xl text-sun-400">{value}</p>
              <p className="text-cream/60 text-xs md:text-sm mt-1 leading-snug">{label}</p>
            </div>
          ))}
        </div>

        <p className="text-cream/70 text-base md:text-lg leading-relaxed text-center max-w-2xl mx-auto mt-14">
          Chaque visuel puise dans les <strong className="text-cream">éléments caractéristiques de la commune</strong> :
          culture locale, paysages, faune et flore endémiques, productions emblématiques.
          Une approche identitaire, visuelle et éducative.
        </p>

      </div>
    </section>
  );
}
