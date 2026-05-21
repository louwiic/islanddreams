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
  MessageSquare,
  Megaphone,
  Shirt,
  Mail,
  FileText,
  Bot,
  HelpCircle,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = { name: string; href: string; icon: React.ComponentType<{ size?: number }> };
type NavGroup = { label: string; items: NavItem[] };

const navigation: (NavItem | NavGroup)[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },

  {
    label: 'Boutique',
    items: [
      { name: 'Produits', href: '/admin/produits', icon: Package },
      { name: 'Catégories', href: '/admin/categories', icon: Tag },
      { name: 'Textile', href: '/admin/textile', icon: Shirt },
      { name: 'Commandes', href: '/admin/commandes', icon: ShoppingCart },
      { name: 'Clients', href: '/admin/clients', icon: Users },
      { name: 'Livraison', href: '/admin/livraison', icon: Truck },
    ],
  },

  {
    label: 'Contenu',
    items: [
      { name: 'Blog', href: '/admin/blog', icon: FileText },
      { name: 'Bannières', href: '/admin/banners', icon: Megaphone },
      { name: 'FAQ', href: '/admin/faq', icon: HelpCircle },
      { name: 'Avis', href: '/admin/avis', icon: Star },
    ],
  },

  {
    label: 'Communication',
    items: [
      { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
      { name: 'Newsletter', href: '/admin/newsletter', icon: Mail },
      { name: 'Chatbot', href: '/admin/chatbot', icon: Bot },
    ],
  },

  {
    label: 'Réglages',
    items: [
      { name: 'SEO', href: '/admin/seo', icon: Search },
      { name: 'Paramètres', href: '/admin/parametres', icon: Settings },
    ],
  },
];

function isGroup(item: NavItem | NavGroup): item is NavGroup {
  return 'items' in item;
}

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

  const renderLink = (item: NavItem) => {
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
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-jungle-600 text-white'
            : 'text-gray-600 hover:bg-gray-50 hover:text-ink'
        )}
      >
        <item.icon size={17} />
        {item.name}
      </Link>
    );
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
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((entry, i) => {
            if (isGroup(entry)) {
              return (
                <div key={entry.label} className={cn(i > 0 && 'pt-4')}>
                  <p className="px-3 mb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {entry.label}
                  </p>
                  <div className="space-y-0.5">
                    {entry.items.map(renderLink)}
                  </div>
                </div>
              );
            }
            return renderLink(entry);
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
