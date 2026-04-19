'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Store,
  Tag,
  Search,
  Truck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Produits', href: '/admin/produits', icon: Package },
  { name: 'Catégories', href: '/admin/categories', icon: Tag },
  { name: 'Commandes', href: '/admin/commandes', icon: ShoppingCart },
  { name: 'Clients', href: '/admin/clients', icon: Users },
  { name: 'Livraison', href: '/admin/livraison', icon: Truck },
  { name: 'SEO', href: '/admin/seo', icon: Search },
  { name: 'Paramètres', href: '/admin/parametres', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Menu admin"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-[260px] bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/admin" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <div className="w-9 h-9 rounded-lg bg-jungle-600 flex items-center justify-center">
              <Store size={18} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-ink text-sm">Island Dreams</p>
              <p className="text-xs text-gray-400">Administration</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-jungle-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-ink'
                )}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors w-full mb-1"
          >
            <Store size={16} />
            Voir la boutique
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors w-full"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
