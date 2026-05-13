import { Navbar } from '@/components/ui/Navbar';
import { CartDrawer } from '@/components/ui/CartDrawer';
import { CartProvider } from '@/lib/cart/CartProvider';
import { NewsletterPopup } from '@/components/ui/NewsletterPopup';
import { getNavFeaturedCategory } from '@/lib/actions/categories';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { MaintenancePage } from '@/components/sections/MaintenancePage';
import { ChatWidgetLoader } from '@/components/chatbot/ChatWidgetLoader';

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

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [featuredCategory, maintenance] = await Promise.all([
    getNavFeaturedCategory(),
    getMaintenanceSettings(),
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
    </CartProvider>
  );
}
