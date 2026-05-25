import { Navbar } from '@/components/ui/Navbar';
import { CartDrawer } from '@/components/ui/CartDrawer';
import { CartProvider } from '@/lib/cart/CartProvider';
import { NewsletterPopup } from '@/components/ui/NewsletterPopup';
import { getNavFeaturedCategory } from '@/lib/actions/categories';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { MaintenancePage } from '@/components/sections/MaintenancePage';
import { ChatWidgetLoader } from '@/components/chatbot/ChatWidgetLoader';
import { DemoVideoWidget, type DemoVideoConfig } from '@/components/shop/DemoVideoWidget';

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
  return config;
}

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [featuredCategory, maintenance, demoVideoConfig] = await Promise.all([
    getNavFeaturedCategory(),
    getMaintenanceSettings(),
    getDemoVideoConfig(),
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
      <Navbar featuredCategory={featuredCategory} />
      {children}
      <CartDrawer />
      <NewsletterPopup />
      <ChatWidgetLoader />
      <DemoVideoWidget config={demoVideoConfig} />
    </CartProvider>
  );
}
