import { Navbar } from '@/components/ui/Navbar';
import { SmoothScroll } from '@/components/ui/SmoothScroll';
import { CartDrawer } from '@/components/ui/CartDrawer';
import { CartProvider } from '@/lib/cart/CartProvider';
import { getNavFeaturedCategory } from '@/lib/actions/categories';

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const featuredCategory = await getNavFeaturedCategory();

  return (
    <CartProvider>
      <SmoothScroll />
      <Navbar featuredCategory={featuredCategory} />
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
