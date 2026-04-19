import { Hero } from '@/components/sections/Hero';
import { FridgeCollection } from '@/components/sections/FridgeCollection';
import { FlyingMagnets } from '@/components/sections/FlyingMagnets';
import { ProductCarousel } from '@/components/sections/ProductCarousel';
import { VillesBlock } from '@/components/sections/VillesBlock';
import { getPublishedProducts } from '@/lib/queries/products';

export default async function Home() {
  const products = await getPublishedProducts();

  return (
    <>
      <Hero />
      <FridgeCollection />
      <FlyingMagnets />
      <ProductCarousel products={products} />

      {/* Sections suivantes (à venir) */}
      <section className="min-h-[40vh] md:min-h-[60vh] bg-jungle-50 flex items-center justify-center px-4">
        <p className="text-ink/40 italic text-sm md:text-base text-center">
          Bloc 4 — Fait ici à La Réunion (à venir)
        </p>
      </section>

      <VillesBlock products={products} />
    </>
  );
}
