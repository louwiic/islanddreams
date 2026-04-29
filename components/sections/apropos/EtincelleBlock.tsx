export function EtincelleBlock() {
  return (
    <section className="bg-cream py-20 md:py-32 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Label */}
        <p className="text-jungle-600 text-xs uppercase tracking-[0.3em] font-bold mb-6 text-center">
          L'étincelle
        </p>

        {/* Titre */}
        <h2 className="apropos-title title-chunky-light text-3xl md:text-5xl text-center mb-10">
          TOUT A COMMENCÉ
          <br />
          EN MÉTROPOLE
        </h2>

        {/* Corps */}
        <div className="space-y-5 text-ink/75 text-base md:text-lg leading-relaxed">
          <p>
            En voyageant en France métropolitaine, le constat était clair : impossible de trouver un souvenir
            qui représente vraiment <strong className="text-ink">sa ville natale réunionnaise</strong>.
            Les rayons regorgent de drapeaux régionaux répétés à l'infini, mais rien qui parle des communes,
            de leur identité propre, de ce qui les rend uniques.
          </p>
          <p>
            Ce vide, Rodophe Smith l'a ressenti comme une évidence : si ce produit n'existait pas,
            il fallait le créer.
          </p>
        </div>

        {/* Pull quote */}
        <blockquote id="apropos-quote" className="my-12 border-l-4 border-sun-400 pl-6 md:pl-8">
          <p className="text-ink text-xl md:text-2xl font-bold italic leading-snug">
            "Presque aucun produit ne mettait en valeur l'identité des villes réunionnaises."
          </p>
        </blockquote>

        <p className="text-ink/75 text-base md:text-lg leading-relaxed">
          Deux ans de recherches, de design et de structuration plus tard, Island Dreams voyait le jour —
          un projet ancré dans l'île, pensé pour les Réunionnais d'ici et d'ailleurs.
        </p>

      </div>
    </section>
  );
}
