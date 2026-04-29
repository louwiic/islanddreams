import Link from 'next/link';

export function CtaBlock() {
  return (
    <section className="bg-cream py-20 md:py-28 px-4">
      <div className="max-w-xl mx-auto text-center">

        <h2 className="title-chunky-light text-3xl md:text-5xl mb-4">
          PRAN
          <br />
          OUT SOUVNIR
        </h2>
        <p className="text-ink/55 italic text-base md:text-lg mb-10">
          Zot vil, zot fiérté péi.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-jungle-700 hover:bg-jungle-800 text-cream font-bold text-sm uppercase tracking-wider rounded-full shadow-lg transition-colors"
          >
            Découvrir la boutique
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-ink text-ink hover:bg-ink hover:text-cream font-bold text-sm uppercase tracking-wider rounded-full transition-colors"
          >
            Nous contacter
          </Link>
        </div>

      </div>
    </section>
  );
}
