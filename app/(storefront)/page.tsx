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
import { HomeReviewsCarousel, type HomeReview } from '@/components/sections/HomeReviewsCarousel';
import { SmoothScroll } from '@/components/ui/SmoothScroll';
import { getPublishedProducts } from '@/lib/queries/products';
import { createAdminClient } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: "Island Dreams — Cadeau personnalisé Réunion 974 | Souvenirs illustrés",
  description:
    "Découvrez Island Dreams, la boutique de cadeaux personnalisés à La Réunion 974 : magnets des communes, stickers 974, textile péi et décoration dessinés et imprimés à La Réunion.",
  keywords: [
    'cadeau personnalisé reunion 974',
    'cadeau personnalisé Réunion 974',
    'cadeaux personnalisés La Réunion',
    'souvenirs illustrés Réunion',
    'magnets communes Réunion',
    'stickers 974',
    'textile péi',
  ],
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

async function getHomeReviews(): Promise<HomeReview[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('reviews' as never)
    .select('id, customer_name, rating, comment, created_at')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(8);

  return (data ?? []) as HomeReview[];
}

export default async function Home() {
  const [products, faqs, reviews] = await Promise.all([
    getPublishedProducts(),
    getSiteFaqs(),
    getHomeReviews(),
  ]);

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
      <HomeReviewsCarousel reviews={reviews} />
      <HomeFaq items={faqs} />
      <VillesBlock products={products} />
      <FooterNarratif />
    </>
  );
}
