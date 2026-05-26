import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { BannerForm } from '../BannerForm';

type Props = {
  params: Promise<{ id: string }>;
};

async function getProducts() {
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, status, tags')
    .order('name');

  if (!products || products.length === 0) return [];

  const { data: images } = await supabase
    .from('product_images')
    .select('product_id, url')
    .in('product_id', products.map((product) => product.id))
    .eq('is_main', true);

  const imageMap = new Map((images ?? []).map((image) => [image.product_id, image.url]));

  return products.map((product) => ({
    ...product,
    image_url: imageMap.get(product.id) ?? null,
  }));
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function productSlugFromLink(link: string) {
  const eventMatch = link.match(/^#evenement-special:([^/?#]+)/);
  if (eventMatch) return eventMatch[1];
  const eventQueryMatch = link.match(/[?&]evenement=([^&#]+)/);
  if (eventQueryMatch) return eventQueryMatch[1];
  const match = link.match(/\/boutique\/([^/?#]+)/);
  return match?.[1] ?? '';
}

export default async function EditBannerPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('hero_banners' as never)
    .select('*')
    .eq('id', id)
    .single();

  if (!data) notFound();

  const banner = data as Record<string, unknown>;
  const products = await getProducts();
  const eventSlug = productSlugFromLink((banner.cta_link as string) ?? '') || slugify((banner.title as string) ?? 'evenement');
  const eventProductIds = products
    .filter((product) => Array.isArray(product.tags) && product.tags.includes(`event:${eventSlug}`))
    .map((product) => product.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Modifier la bannière</h1>
      <BannerForm
        initialData={{
          id: banner.id as string,
          title: banner.title as string,
          subtitle: (banner.subtitle as string) ?? '',
          image_url: (banner.image_url as string) ?? '',
          cta_text: (banner.cta_text as string) ?? 'Découvrir',
          cta_link: (banner.cta_link as string) ?? '/boutique',
          event_slug: eventSlug,
          event_product_ids: eventProductIds,
          start_date: banner.start_date as string,
          end_date: banner.end_date as string,
          priority: (banner.priority as number) ?? 0,
          is_active: (banner.is_active as boolean) ?? true,
        }}
        products={products}
      />
    </div>
  );
}
