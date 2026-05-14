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
import { HomeFaq } from '@/components/sections/HomeFaq';
import { SmoothScroll } from '@/components/ui/SmoothScroll';
import { getPublishedProducts } from '@/lib/queries/products';
import { createAdminClient } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: "Island Dreams — Souvenirs illustrés de La Réunion | Magnets, Stickers, Textile 974",
  description:
    "Découvrez Island Dreams, la boutique de souvenirs illustrés de La Réunion. Magnets des communes, stickers 974, textile péi, décoration — dessinés et imprimés à La Réunion.",
  alternates: { canonical: '/' },
};

async function getSiteFaqs() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('site_faqs' as never)
    .select('id, question, answer')
    .eq('is_active', true)
    .order('position');
  return (data ?? []) as { id: string; question: string; answer: string }[];
}

export default async function Home() {
  const [products, faqs] = await Promise.all([getPublishedProducts(), getSiteFaqs()]);

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
      <HomeFaq items={faqs} />
      <VillesBlock products={products} />
      <FooterNarratif />
    </>
  );
}
