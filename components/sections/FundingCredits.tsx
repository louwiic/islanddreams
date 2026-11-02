import Image from 'next/image';

export function FundingCredits() {
  return (
    <section aria-labelledby="funding-title" lang="fr">
      <h3
        id="funding-title"
        className="mb-4 text-lg font-black uppercase tracking-wide text-cream"
        style={{ fontFamily: 'var(--font-heading, serif)' }}
      >
        Un projet soutenu
      </h3>
      <a
        href="https://www.regionreunion.com/actualites/votre-projet-feder-2021-2027/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Découvrir le programme FEDER de la Région Réunion (nouvel onglet)"
        className="block max-w-md rounded-xl bg-white p-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sun-400"
      >
        <Image
          src="/images/funding/region-reunion-union-europeenne.png"
          alt="Cofinancé par l’Union européenne et la Région Réunion"
          width={871}
          height={343}
          sizes="(max-width: 768px) calc(100vw - 88px), 408px"
          className="h-auto w-full"
        />
      </a>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/80">
        Ce site est cofinancé par l’Union européenne et la Région Réunion.
        L’Europe s’engage à La Réunion avec le Fonds FEDER.
      </p>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-cream/60">
        Ce soutien accompagne le développement de la boutique en ligne Island Dreams
        et la présentation de ses créations réunionnaises.
      </p>
    </section>
  );
}
