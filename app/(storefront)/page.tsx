import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { FridgeCollection } from '@/components/sections/FridgeCollection';
import { FlyingMagnets } from '@/components/sections/FlyingMagnets';

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
import { EventProductFeature, type EventFeatureConfig } from '@/components/sections/EventProductFeature';
import { SmoothScroll } from '@/components/ui/SmoothScroll';
import { getPublishedProducts } from '@/lib/queries/products';
import { createAdminClient } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: "Cadeau personnalisé Réunion 974 — Island Dreams | Souvenirs illustrés",
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

type ActiveBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
};

function productSlugFromLink(link: string | null) {
  if (!link) return '';
  const eventMatch = link.match(/^#evenement-special:([^/?#]+)/);
  if (eventMatch) return eventMatch[1];
  const eventQueryMatch = link.match(/[?&]evenement=([^&#]+)/);
  if (eventQueryMatch) return eventQueryMatch[1];
  return '';
}

async function getActiveEventBanner(): Promise<ActiveBanner | null> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from('hero_banners' as never)
    .select('id, title, subtitle, image_url, cta_text, cta_link')
    .eq('is_active', true)
    .lte('start_date', today)
    .gte('end_date', today)
    .order('priority', { ascending: false })
    .limit(1);

  if (!data || data.length === 0) return null;
  return data[0] as unknown as ActiveBanner;
}

export default async function Home() {
  const [products, faqs, reviews, activeBanner] = await Promise.all([
    getPublishedProducts(),
    getSiteFaqs(),
    getHomeReviews(),
    getActiveEventBanner(),
  ]);
  const eventProductSlug = productSlugFromLink(activeBanner?.cta_link ?? null);
  const eventFeatureConfig: EventFeatureConfig | null =
    activeBanner && eventProductSlug
      ? {
          enabled: true,
          badge: 'Événement spécial',
          title: activeBanner.title,
          description:
            activeBanner.subtitle ||
            'Un souvenir de La Réunion à offrir pour marquer le moment.',
          ctaLabel: activeBanner.cta_text || 'Découvrir le produit',
          image: activeBanner.image_url || null,
          imageAlt: activeBanner.title,
          href: `/boutique?evenement=${eventProductSlug}`,
        }
      : null;

  return (
    <>
      <SmoothScroll />
      <Hero />
      <EventProductFeature config={eventFeatureConfig} />
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
