'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Package, ChevronDown, ChevronUp, MapPin, User, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const STATUS: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  pending:   { label: 'En attente',      dot: 'bg-yellow-400', bg: 'bg-yellow-50',  text: 'text-yellow-800' },
  confirmed: { label: 'Confirmée',       dot: 'bg-blue-400',   bg: 'bg-blue-50',    text: 'text-blue-800' },
  preparing: { label: 'En préparation',  dot: 'bg-purple-400', bg: 'bg-purple-50',  text: 'text-purple-800' },
  shipped:   { label: 'Expédiée',        dot: 'bg-jungle-400', bg: 'bg-jungle-50',  text: 'text-jungle-800' },
  delivered: { label: 'Livrée',          dot: 'bg-green-400',  bg: 'bg-green-50',   text: 'text-green-800' },
  cancelled: { label: 'Annulée',         dot: 'bg-red-400',    bg: 'bg-red-50',     text: 'text-red-700' },
  refunded:  { label: 'Remboursée',      dot: 'bg-gray-400',   bg: 'bg-gray-100',   text: 'text-gray-600' },
};

type OrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  variant_label: string | null;
  quantity: number;
  unit_price: number;
  total: number;
};

type Order = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  subtotal: number;
  shipping_cost: number | null;
  created_at: string;
  shipping_address: {
    name?: string; line1?: string; line2?: string;
    city?: string; postal_code?: string; country?: string;
  } | null;
  order_items: OrderItem[];
};

type Props = {
  user: { email: string; id: string };
  customer: { first_name: string | null; last_name: string | null; email: string } | null;
  orders: Order[];
  imageMap: Record<string, { url: string; alt: string | null }>;
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, dot: 'bg-gray-400', bg: 'bg-gray-100', text: 'text-gray-600' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function OrderCard({ order, imageMap }: { order: Order; imageMap: Record<string, { url: string; alt: string | null }> }) {
  const [open, setOpen] = useState(false);

  const date = new Date(order.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  // Aperçu : 3 premières images pour la card fermée
  const previewItems = order.order_items.slice(0, 3);
  const remaining = order.order_items.length - 3;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-ink/8 overflow-hidden transition-shadow hover:shadow-md">
      {/* Header cliquable */}
      <button
        className="w-full text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="px-5 pt-4 pb-3">
          {/* Ligne 1 : numéro + statut + total */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <p className="font-bold text-ink">#{order.order_number}</p>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-ink">{order.total.toFixed(2)} €</span>
              {open
                ? <ChevronUp size={15} className="text-ink/30" />
                : <ChevronDown size={15} className="text-ink/30" />}
            </div>
          </div>

          {/* Ligne 2 : date + aperçu images */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-ink/40">{date}</p>

            {/* Aperçu photos produits */}
            <div className="flex items-center gap-1.5">
              {previewItems.map((item) => {
                const img = item.product_id ? imageMap[item.product_id] : null;
                return (
                  <div
                    key={item.id}
                    className="w-10 h-10 rounded-lg bg-cream border border-ink/8 overflow-hidden shrink-0 relative"
                  >
                    {img ? (
                      <Image
                        src={img.url}
                        alt={img.alt || item.product_name}
                        fill
                        className="object-contain p-1"
                        sizes="40px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={14} className="text-ink/20" />
                      </div>
                    )}
                  </div>
                );
              })}
              {remaining > 0 && (
                <div className="w-10 h-10 rounded-lg bg-ink/5 border border-ink/8 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-ink/40">+{remaining}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Détail déplié */}
      {open && (
        <div className="border-t border-ink/8">
          {/* Liste articles */}
          <div className="px-5 py-4 space-y-3">
            {order.order_items.map((item) => {
              const img = item.product_id ? imageMap[item.product_id] : null;
              return (
                <div key={item.id} className="flex items-center gap-3">
                  {/* Photo */}
                  <div className="w-16 h-16 rounded-xl bg-cream border border-ink/8 overflow-hidden shrink-0 relative">
                    {img ? (
                      <Image
                        src={img.url}
                        alt={img.alt || item.product_name}
                        fill
                        className="object-contain p-1.5"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={20} className="text-ink/20" />
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink leading-tight line-clamp-2">
                      {item.product_name}
                    </p>
                    {item.variant_label && (
                      <p className="text-xs text-ink/40 mt-0.5">{item.variant_label}</p>
                    )}
                    <p className="text-xs text-ink/50 mt-0.5">
                      {item.unit_price.toFixed(2)} € × {item.quantity}
                    </p>
                  </div>

                  {/* Prix ligne */}
                  <p className="text-sm font-bold text-ink shrink-0">
                    {item.total.toFixed(2)} €
                  </p>
                </div>
              );
            })}
          </div>

          {/* Récap financier */}
          <div className="mx-5 mb-4 rounded-xl bg-gray-50 divide-y divide-ink/6 overflow-hidden text-sm">
            <div className="flex justify-between px-4 py-2.5 text-ink/60">
              <span>Sous-total</span>
              <span>{(order.subtotal ?? order.total).toFixed(2)} €</span>
            </div>
            {(order.shipping_cost ?? 0) > 0 && (
              <div className="flex justify-between px-4 py-2.5 text-ink/60">
                <span>Livraison</span>
                <span>{(order.shipping_cost ?? 0).toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between px-4 py-2.5 font-bold text-ink">
              <span>Total</span>
              <span>{order.total.toFixed(2)} €</span>
            </div>
          </div>

          {/* Adresse livraison */}
          {order.shipping_address?.line1 && (
            <div className="mx-5 mb-5 rounded-xl border border-ink/8 px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <MapPin size={13} className="text-jungle-600" />
                <p className="text-xs font-semibold text-ink/50 uppercase tracking-wider">Adresse de livraison</p>
              </div>
              <p className="text-sm text-ink/70 leading-relaxed">
                {order.shipping_address.name && (
                  <span className="block font-semibold text-ink">{order.shipping_address.name}</span>
                )}
                {order.shipping_address.line1}
                {order.shipping_address.line2 && `, ${order.shipping_address.line2}`}
                <br />
                {order.shipping_address.postal_code} {order.shipping_address.city}
                {order.shipping_address.country && `, ${order.shipping_address.country}`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AccountDashboard({ user, customer, orders, imageMap }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const displayName = customer?.first_name
    ? `${customer.first_name}${customer.last_name ? ` ${customer.last_name}` : ''}`
    : user.email.split('@')[0];

  return (
    <main className="bg-cream min-h-screen">
      <div className="bg-jungle-800 pt-24 pb-8" />
      <div className="px-4 pt-8 pb-16 max-w-xl mx-auto">

        {/* Header compte */}
        <div className="bg-white rounded-2xl border border-ink/8 px-5 py-4 flex items-center justify-between mb-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-jungle-600 flex items-center justify-center shrink-0">
              <User size={20} className="text-cream" />
            </div>
            <div>
              <p className="font-bold text-ink capitalize">{displayName}</p>
              <p className="text-xs text-ink/40">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-ink/40 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>

        {/* Section commandes */}
        <div className="flex items-center gap-2 mb-4">
          <Package size={16} className="text-jungle-600" />
          <h2 className="font-bold text-ink">Mes commandes</h2>
          {orders.length > 0 && (
            <span className="text-xs bg-jungle-100 text-jungle-700 font-bold px-2 py-0.5 rounded-full">
              {orders.length}
            </span>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-ink/8 px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={24} className="text-gray-300" />
            </div>
            <p className="text-ink/50 text-sm mb-4">Aucune commande pour le moment.</p>
            <Link
              href="/boutique"
              className="inline-block px-5 py-2.5 bg-jungle-700 text-cream text-sm font-bold rounded-xl hover:bg-jungle-800 transition-colors"
            >
              Découvrir la boutique
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} imageMap={imageMap} />
              ))}
            </div>

            <Link
              href="/boutique"
              className="mt-4 flex items-center justify-center gap-2 w-full py-3 border-2 border-jungle-600 text-jungle-700 text-sm font-bold rounded-xl hover:bg-jungle-600 hover:text-cream transition-colors"
            >
              <ShoppingBag size={16} />
              Retourner à la boutique
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
