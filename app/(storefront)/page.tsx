import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { FridgeCollection } from '@/components/sections/FridgeCollection';
import { FlyingMagnets } from '@/components/sections/FlyingMagnets';
import { EventBanner } from '@/components/sections/EventBanner';

import { ProductCarousel } from '@/components/sections/ProductCarousel';
import { FrizeLivraison } from '@/components/sections/FrizeLivraison';
import { ServiettePlage } from '@/components/sections/ServiettePlage';
import { FemmePlage } from '@/components/sections/FemmePlage';
import { VillesBlock } from '@/components/sections/VillesBlock';
import { FooterNarratif } from '@/components/sections/FooterNarratif';
import { CarteCollection } from '@/components/sections/CarteCollection';
import { UspBanner } from '@/components/sections/UspBanner';
import { SmoothScroll } from '@/components/ui/SmoothScroll';
import { getPublishedProducts } from '@/lib/queries/products';

export const metadata: Metadata = {
  title: "Island Dreams — Souvenirs illustrés de La Réunion | Magnets, Stickers, Textile 974",
  description:
    "Découvrez Island Dreams, la boutique de souvenirs illustrés de La Réunion. Magnets des communes, stickers 974, textile péi, décoration — dessinés et imprimés à La Réunion.",
  alternates: { canonical: '/' },
};

export default async function Home() {
  const products = await getPublishedProducts();

  return (
    <>
      <SmoothScroll />
      <EventBanner />
      <Hero />
      <FridgeCollection />
      <FlyingMagnets />
      <FrizeLivraison />
      <ProductCarousel products={products} />
      <ServiettePlage />
      <FemmePlage />
      <UspBanner />
      <CarteCollection />

      <VillesBlock products={products} />
      <FooterNarratif />
    </>
  );
}
