import { Navbar } from '@/components/ui/Navbar';
import { CartDrawer } from '@/components/ui/CartDrawer';
import { CartProvider } from '@/lib/cart/CartProvider';
import { NewsletterPopup } from '@/components/ui/NewsletterPopup';
import { getNavFeaturedCategory } from '@/lib/actions/categories';

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const featuredCategory = await getNavFeaturedCategory();

  return (
    <CartProvider>
      <Navbar featuredCategory={featuredCategory} />
      {children}
      <CartDrawer />
      <NewsletterPopup />
    </CartProvider>
  );
}
