import Image from 'next/image';
import Link from 'next/link';

const cartes = [
  {
    slug: 'carte-magnetique-de-la-reunion',
    name: 'Carte Magnétique de La Réunion',
    price: '30,00',
    image:
      'https://sgxilglkeupxpnzkzqfq.supabase.co/storage/v1/object/public/product-images/carte-magnetique-de-la-reunion/0.jpg',
  },
  {
    slug: 'carte-poster-de-la-reunion',
    name: 'Carte Poster de La Réunion',
    price: '15,00',
    image:
      'https://sgxilglkeupxpnzkzqfq.supabase.co/storage/v1/object/public/product-images/carte-poster-de-la-reunion/0.jpg',
  },
];

export function CompletezCarte() {
  return (
    <section className="relative bg-[#e8e4dc] py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Image mockup à gauche */}
          <div className="relative">
            <Image
              src="/images/sections/header-element-responsive.png"
              alt="Carte magnétique et carte poster de La Réunion avec les magnets des 27 communes"
              width={800}
              height={800}
              className="w-full h-auto max-w-[550px] mx-auto lg:mx-0 drop-shadow-2xl"
              priority
            />
          </div>

          {/* Contenu à droite */}
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl lg:text-5xl font-bold text-jungle-800 leading-[1.1] tracking-tight">
              COMPLÉTEZ VOTRE CARTE DE LA RÉUNION !
            </h2>

            <div className="mt-6 space-y-4 text-ink/80 text-sm md:text-base leading-relaxed">
              <p>
                Que ce soit pour un usage décoratif ou éducatif collectionnez nos
                stickers et/ou magnets des différentes communes de la Réunion !
                Nous avons soigneusement désigné leurs visuels afin de valoriser
                les spécificités et la culture de chaque commune.
              </p>
              <p>
                Island Dreams vous propose 2 supports différents pour lancer
                votre collection : une affiche de type « poster » ou une carte
                magnétique pour plus de fun !
              </p>
              <p className="font-semibold text-ink">
                Prêts ? Collectionnez !
              </p>
            </div>

            {/* Deux cartes produit */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {cartes.map((carte) => (
                <Link
                  key={carte.slug}
                  href={`/boutique/${carte.slug}`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square relative bg-gray-50 p-4">
                    <Image
                      src={carte.image}
                      alt={carte.name}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 45vw, 22vw"
                    />
                  </div>
                  <div className="p-3 md:p-4 text-center">
                    <h3 className="text-xs md:text-sm font-bold text-ink uppercase leading-tight">
                      {carte.name}
                    </h3>
                    <p className="mt-1 text-jungle-700 font-black text-lg">
                      {carte.price} €
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
