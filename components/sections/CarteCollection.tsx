'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Check } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/lib/cart/CartProvider';
import type { CartItem } from '@/lib/cart/types';

const PRODUCTS = [
  {
    id: 'a610f09f-8d66-4de7-81d8-f65e7c36ee25',
    slug: 'carte-magnetique-de-la-reunion',
    name: 'Carte Magnétique de La Réunion',
    price: 30,
    image: 'https://sgxilglkeupxpnzkzqfq.supabase.co/storage/v1/object/public/product-images/carte-magnetique-de-la-reunion/0.jpg',
  },
  {
    id: '55703cbd-3c8e-48c4-9981-7865346226d7',
    slug: 'carte-poster-de-la-reunion',
    name: 'Carte Poster de La Réunion',
    price: 15,
    image: 'https://sgxilglkeupxpnzkzqfq.supabase.co/storage/v1/object/public/product-images/carte-poster-de-la-reunion/0.jpg',
  },
];

function QuickAddButton({ product }: { product: typeof PRODUCTS[number] }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    const item: CartItem = {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    };
    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${
        added
          ? 'bg-jungle-500 text-white'
          : 'bg-jungle-700 hover:bg-jungle-800 text-cream'
      }`}
    >
      {added ? (
        <>
          <Check size={16} />
          Ajouté !
        </>
      ) : (
        <>
          <ShoppingBag size={16} />
          Ajouter Au Panier
        </>
      )}
    </button>
  );
}

export function CarteCollection() {
  return (
    <section className="relative bg-[#dde3e5] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] min-h-[750px] lg:min-h-[1024px]">

        {/* ── Gauche : image produit, même hauteur que le bloc droite ── */}
        <div className="relative h-[400px] sm:h-[500px] lg:h-auto overflow-hidden">
          <Image
            src="/images/map/carte_fond_transparent.webp"
            alt="Carte de La Réunion avec magnets des communes"
            width={1024}
            height={1024}
            className="absolute top-0 right-0 h-full w-auto max-w-none"
            priority
          />
        </div>

        {/* ── Droite : texte + produits ── */}
        <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 lg:py-20">
          {/* Titre créole */}
          <h2
            className="text-3xl sm:text-4xl lg:text-[2.8rem] font-black uppercase leading-[1.1] text-jungle-700 mb-8"
            style={{ fontFamily: 'var(--font-heading, serif)' }}
          >
            Nout Zîl dann&apos; la main !
          </h2>

          {/* Description */}
          <p className="text-ink/70 text-xs md:text-sm italic max-w-xl mb-3">
            Que ce soit pour un usage décoratif ou éducatif, collectionnez nos stickers
            et magnets des différentes communes de La Réunion ! Chaque visuel a été
            soigneusement dessiné afin de valoriser les spécificités et la culture
            de chaque commune.
          </p>
          <p className="text-ink/70 text-xs md:text-sm italic max-w-xl mb-3">
            Island Dreams vous propose 2 supports différents pour lancer votre
            collection : une affiche de type « poster » ou une carte magnétique
            pour plus de fun !
          </p>
          <p className="text-ink/70 text-xs md:text-sm italic font-semibold mb-10">
            Prêts ? Collectionnez !
          </p>

          {/* Deux produits côte à côte */}
          <div className="grid grid-cols-2 gap-5 sm:gap-8 max-w-xl">
            {PRODUCTS.map((product) => (
              <div key={product.id} className="flex flex-col items-center text-center">
                <Link
                  href={`/boutique/${product.slug}`}
                  className="w-full"
                >
                  <div className="aspect-square relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 45vw, 280px"
                    />
                  </div>
                </Link>

                {/* Nom + prix + CTA — hauteur égale */}
                <div className="flex flex-col items-center flex-1">
                  <Link href={`/boutique/${product.slug}`}>
                    <h3 className="font-black text-ink text-sm sm:text-base uppercase tracking-wide leading-tight mt-5 mb-3 hover:text-jungle-600 transition-colors min-h-[3rem] flex items-center text-center">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sun-500 font-bold text-lg sm:text-xl mb-4">
                    {product.price.toFixed(2)}{' '}
                    <span className="text-sun-500">€</span>
                  </p>
                  <div className="mt-auto">
                    <QuickAddButton product={product} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
