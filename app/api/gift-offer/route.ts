import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

function settingToString(value: unknown) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);
  return '';
}

export async function GET() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('shop_settings')
    .select('key, value')
    .in('key', [
      'gift_offer_enabled',
      'gift_offer_min_amount',
      'gift_offer_product_slug',
      'gift_offer_title',
      'gift_offer_description',
    ]);

  const settings = Object.fromEntries(
    ((data ?? []) as { key: string; value: unknown }[]).map((row) => [
      row.key,
      settingToString(row.value),
    ])
  );

  const enabled = settings.gift_offer_enabled === 'true' || settings.gift_offer_enabled === '1';
  const minAmount = Number(String(settings.gift_offer_min_amount || '0').replace(',', '.'));
  const productSlug = settings.gift_offer_product_slug || '';

  if (!enabled || !productSlug || !Number.isFinite(minAmount) || minAmount <= 0) {
    return NextResponse.json({ enabled: false });
  }

  const { data: product } = await supabase
    .from('products')
    .select('id, name, slug, status')
    .eq('slug', productSlug)
    .eq('status', 'publish')
    .maybeSingle();

  if (!product) return NextResponse.json({ enabled: false });

  const { data: image } = await supabase
    .from('product_images')
    .select('url, alt')
    .eq('product_id', product.id)
    .eq('is_main', true)
    .maybeSingle();

  return NextResponse.json({
    enabled: true,
    minAmount,
    title: settings.gift_offer_title || 'Un cadeau vous attend',
    description:
      settings.gift_offer_description ||
      'Ajoutez vos souvenirs préférés au panier et débloquez un cadeau offert.',
    product: {
      name: product.name,
      slug: product.slug,
      image: image?.url || null,
      imageAlt: image?.alt || product.name,
    },
  });
}
