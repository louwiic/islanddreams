import { Navbar } from '@/components/ui/Navbar';
import { CartDrawer } from '@/components/ui/CartDrawer';
import { CartProvider } from '@/lib/cart/CartProvider';
import { NewsletterPopup } from '@/components/ui/NewsletterPopup';
import { getNavFeaturedCategory } from '@/lib/actions/categories';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import Script from 'next/script';
import { MaintenancePage } from '@/components/sections/MaintenancePage';
import { ChatWidgetLoader } from '@/components/chatbot/ChatWidgetLoader';
import { DemoVideoWidget, type DemoVideoConfig } from '@/components/shop/DemoVideoWidget';
import { GiftOfferFloatingPopup } from '@/components/shop/GiftOfferFloatingPopup';
import { EventBanner, getActiveBanner } from '@/components/sections/EventBanner';
import { ContestPopup, type ContestPopupConfig } from '@/components/ui/ContestPopup';

export const dynamic = 'force-dynamic';

function settingToString(value: unknown) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);
  return '';
}

async function getMaintenanceSettings() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('shop_settings')
    .select('key, value')
    .in('key', ['maintenance_mode', 'maintenance_pin']);

  const map = Object.fromEntries(
    ((data ?? []) as { key: string; value: string }[]).map((r) => [r.key, r.value])
  );
  return {
    enabled: map['maintenance_mode'] === 'true',
    pin: map['maintenance_pin'] ?? '1234',
  };
}

async function getDemoVideoConfig(): Promise<DemoVideoConfig | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('shop_settings')
    .select('key, value')
    .in('key', [
      'demo_video_enabled',
      'demo_video_url',
      'demo_video_poster_url',
      'demo_video_product_slug',
      'demo_video_title',
      'demo_video_bubble_position',
    ]);

  const settings = Object.fromEntries(
    ((data ?? []) as { key: string; value: unknown }[]).map((row) => [
      row.key,
      settingToString(row.value),
    ])
  );

  const position = settings.demo_video_bubble_position === 'bottom-left' ? 'bottom-left' : 'bottom-right';
  const config: DemoVideoConfig = {
    enabled: settings.demo_video_enabled === 'true' || settings.demo_video_enabled === '1',
    videoUrl: settings.demo_video_url || '',
    posterUrl: settings.demo_video_poster_url || undefined,
    productSlug: settings.demo_video_product_slug || '',
    title: settings.demo_video_title || 'Voir le produit en action',
    position,
  };

  if (!config.enabled || !config.videoUrl || !config.productSlug) return null;

  const { data: product } = await supabase
    .from('products')
    .select('id, slug, name, price, sale_price, in_stock, weight_grams, manage_stock, stock_quantity')
    .eq('slug', config.productSlug)
    .eq('status', 'publish')
    .single();

  if (product) {
    const { data: mainImage } = await supabase
      .from('product_images')
      .select('url, alt')
      .eq('product_id', product.id)
      .eq('is_main', true)
      .maybeSingle();

    config.product = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      salePrice: product.sale_price,
      image: mainImage?.url ?? null,
      imageAlt: mainImage?.alt ?? null,
      inStock: product.in_stock ?? false,
      weightGrams: product.weight_grams,
      manageStock: product.manage_stock,
      stockQuantity: product.stock_quantity,
    };
  }

  return config;
}

function isActiveDateRange(startDate: string, endDate: string) {
  const today = new Date().toISOString().slice(0, 10);
  return (!startDate || startDate <= today) && (!endDate || endDate >= today);
}

async function getContestPopupConfig(): Promise<ContestPopupConfig | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('shop_settings')
    .select('key, value')
    .in('key', [
      'contest_popup_enabled',
      'contest_popup_prize_source',
      'contest_popup_product_slug',
      'contest_popup_title',
      'contest_popup_description',
      'contest_popup_image_url',
      'contest_popup_prize_url',
      'contest_popup_start_date',
      'contest_popup_end_date',
      'contest_popup_question',
      'contest_popup_require_answer',
      'contest_popup_terms_text',
      'contest_popup_social_text',
      'contest_popup_facebook_url',
      'contest_popup_instagram_url',
      'contest_popup_tiktok_url',
    ]);

  const settings = Object.fromEntries(
    ((data ?? []) as { key: string; value: unknown }[]).map((row) => [
      row.key,
      settingToString(row.value),
    ])
  );

  const prizeSource = settings.contest_popup_prize_source || 'manual';
  const productSlug = settings.contest_popup_product_slug || '';
  const config: ContestPopupConfig = {
    enabled: settings.contest_popup_enabled === 'true' || settings.contest_popup_enabled === '1',
    title: settings.contest_popup_title || 'Jeu concours Island Dreams',
    description: settings.contest_popup_description || '',
    imageUrl: settings.contest_popup_image_url || '',
    prizeUrl: settings.contest_popup_prize_url || '',
    startDate: settings.contest_popup_start_date || '',
    endDate: settings.contest_popup_end_date || '',
    question: settings.contest_popup_question || '',
    requireAnswer: settings.contest_popup_require_answer === 'true',
    termsText:
      settings.contest_popup_terms_text ||
      'J’accepte que mes données soient utilisées pour ma participation au jeu concours et pour recevoir des communications commerciales d’Island Dreams.',
    socialText: settings.contest_popup_social_text || 'Double tes chances en participant aussi sur nos réseaux',
    termsUrl: '/conditions-jeu-concours',
    facebookUrl: settings.contest_popup_facebook_url || 'https://www.facebook.com/islanddreams974/',
    instagramUrl: settings.contest_popup_instagram_url || 'https://www.instagram.com/islanddreams.re/',
    tiktokUrl: settings.contest_popup_tiktok_url || '',
  };

  if (!config.enabled || !isActiveDateRange(config.startDate, config.endDate)) return null;

  if (prizeSource === 'product' && productSlug) {
    const { data: product } = await supabase
      .from('products')
      .select('id, slug, name')
      .eq('slug', productSlug)
      .eq('status', 'publish')
      .maybeSingle();

    if (product) {
      const { data: mainImage } = await supabase
        .from('product_images')
        .select('url')
        .eq('product_id', product.id)
        .eq('is_main', true)
        .maybeSingle();

      config.imageUrl = mainImage?.url || config.imageUrl;
      config.prizeUrl = `/boutique/${product.slug}`;
      if (!settings.contest_popup_title) config.title = product.name;
    }
  }

  return config;
}

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [featuredCategory, maintenance, demoVideoConfig, contestPopupConfig, activeBanner] = await Promise.all([
    getNavFeaturedCategory(),
    getMaintenanceSettings(),
    getDemoVideoConfig(),
    getContestPopupConfig(),
    getActiveBanner(),
  ]);

  if (maintenance.enabled) {
    const cookieStore = await cookies();
    const bypass = cookieStore.get('maintenance_bypass')?.value;
    if (bypass !== maintenance.pin) {
      return <MaintenancePage />;
    }
  }

  return (
    <CartProvider>
      <EventBanner banner={activeBanner} />
      <Navbar featuredCategory={featuredCategory} hasEventBanner={Boolean(activeBanner)} />
      {children}
      <Script
        defer
        data-domain="islanddreams.re"
        src="https://analytics.peibox.fr/js/script.js"
        strategy="afterInteractive"
      />
      <CartDrawer />
      {contestPopupConfig ? <ContestPopup config={contestPopupConfig} /> : <NewsletterPopup />}
      <ChatWidgetLoader />
      <GiftOfferFloatingPopup />
      <DemoVideoWidget config={demoVideoConfig} />
    </CartProvider>
  );
}
