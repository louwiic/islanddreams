'use client';

import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/produits': 'Produits',
  '/admin/categories': 'Catégories',
  '/admin/produits/nouveau': 'Nouveau produit',
  '/admin/produits/import': 'Importer des produits',
  '/admin/commandes': 'Commandes',
  '/admin/clients': 'Clients',
  '/admin/livraison': 'Livraison',
  '/admin/seo': 'SEO',
  '/admin/parametres': 'Paramètres',
};

// Pour les routes dynamiques type /admin/produits/[id]
function resolveTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith('/admin/produits/') && pathname !== '/admin/produits/nouveau' && pathname !== '/admin/produits/import') {
    return 'Modifier le produit';
  }
  if (pathname.startsWith('/admin/commandes/')) return 'Détail commande';
  return 'Admin';
}

export function AdminHeader() {
  const pathname = usePathname();
  const title = resolveTitle(pathname);

  return (
    <header className="sticky top-0 z-30 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 lg:px-8 py-4">
        {/* Spacer mobile pour le burger */}
        <div className="lg:hidden w-10" />
        <h1 className="text-lg font-semibold text-ink">{title}</h1>
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-gray-200/50 transition-colors">
            <Bell size={18} className="text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-coral-500 rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full bg-jungle-100 flex items-center justify-center text-xs font-bold text-jungle-700">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
