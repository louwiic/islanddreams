import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

function eventTag(slug: string) {
  return `event:${slug}`;
}

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = createAdminClient();

  const record = {
    title: body.title,
    subtitle: body.subtitle || null,
    image_url: body.image_url || null,
    cta_text: body.cta_text || 'Découvrir',
    cta_link: body.cta_link || '/boutique',
    start_date: body.start_date,
    end_date: body.end_date,
    priority: body.priority ?? 0,
    is_active: body.is_active ?? true,
  };

  const eventSlug = typeof body.event_slug === 'string' ? body.event_slug.trim() : '';
  const previousEventSlug =
    typeof body.previous_event_slug === 'string' ? body.previous_event_slug.trim() : '';
  const selectedProductIds = Array.isArray(body.event_product_ids)
    ? new Set(body.event_product_ids.filter((id: unknown) => typeof id === 'string'))
    : new Set<string>();

  if (body.id) {
    await supabase
      .from('hero_banners' as never)
      .update(record as never)
      .eq('id', body.id);
  } else {
    await supabase
      .from('hero_banners' as never)
      .insert(record as never);
  }

  if (eventSlug) {
    const activeTag = eventTag(eventSlug);
    const oldTag = previousEventSlug ? eventTag(previousEventSlug) : activeTag;
    const { data: products } = await supabase
      .from('products')
      .select('id, tags');

    await Promise.all(
      (products ?? []).map((product) => {
        const tags = Array.isArray(product.tags) ? product.tags : [];
        const cleaned = tags.filter((tag) => tag !== activeTag && tag !== oldTag);
        const nextTags = selectedProductIds.has(product.id)
          ? [...cleaned, activeTag]
          : cleaned;

        if (nextTags.length === tags.length && nextTags.every((tag, index) => tag === tags[index])) {
          return Promise.resolve();
        }

        return supabase
          .from('products')
          .update({ tags: nextTags } as never)
          .eq('id', product.id);
      })
    );
  }

  return NextResponse.json({ ok: true });
}
