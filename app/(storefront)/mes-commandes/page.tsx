'use client';

import { useState } from 'react';
import { PackageSearch, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: 'En attente',    color: 'bg-yellow-100 text-yellow-800' },
  confirmed:  { label: 'Confirmée',     color: 'bg-blue-100 text-blue-800' },
  preparing:  { label: 'En préparation', color: 'bg-purple-100 text-purple-800' },
  shipped:    { label: 'Expédiée',      color: 'bg-jungle-100 text-jungle-800' },
  delivered:  { label: 'Livrée',        color: 'bg-green-100 text-green-800' },
  cancelled:  { label: 'Annulée',       color: 'bg-red-100 text-red-800' },
  refunded:   { label: 'Remboursée',    color: 'bg-gray-100 text-gray-600' },
};

type OrderItem = {
  id: string;
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
  created_at: string;
  shipping_address: {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  } | null;
  order_items: OrderItem[];
};

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const status = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600' };
  const date = new Date(order.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-ink/8 overflow-hidden">
      <button
        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div>
            <p className="font-bold text-ink text-sm">#{order.order_number}</p>
            <p className="text-xs text-ink/40 mt-0.5">{date}</p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-bold text-ink">{order.total.toFixed(2)} €</span>
          {open ? <ChevronUp size={16} className="text-ink/40" /> : <ChevronDown size={16} className="text-ink/40" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-ink/8 px-5 py-4 space-y-4">
          {/* Articles */}
          <ul className="divide-y divide-ink/6">
            {order.order_items.map((item) => (
              <li key={item.id} className="py-2.5 flex justify-between items-center gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">{item.product_name}</p>
                  {item.variant_label && (
                    <p className="text-xs text-ink/40">{item.variant_label}</p>
                  )}
                  {item.quantity > 1 && (
                    <p className="text-xs text-ink/40">× {item.quantity}</p>
                  )}
                </div>
                <span className="text-sm font-bold text-ink shrink-0">
                  {item.total.toFixed(2)} €
                </span>
              </li>
            ))}
          </ul>

          {/* Adresse */}
          {order.shipping_address?.line1 && (
            <div className="pt-2 border-t border-ink/6">
              <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-1">
                Livraison
              </p>
              <p className="text-sm text-ink/70 leading-relaxed">
                {order.shipping_address.name && (
                  <span className="block font-medium text-ink">{order.shipping_address.name}</span>
                )}
                {order.shipping_address.line1}
                {order.shipping_address.line2 && `, ${order.shipping_address.line2}`}
                <br />
                {order.shipping_address.postal_code} {order.shipping_address.city}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MesCommandesPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const res = await fetch('/api/mes-commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <main className="bg-cream min-h-screen">
      <div className="bg-jungle-800 pt-24 pb-8" />
      <div className="px-4 pt-10 pb-16 max-w-xl mx-auto">

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-jungle-100 flex items-center justify-center mx-auto mb-4">
            <PackageSearch size={30} className="text-jungle-600" />
          </div>
          <h1 className="text-2xl font-bold text-ink">Mes commandes</h1>
          <p className="mt-2 text-ink/60 text-sm">
            Entrez l&apos;email utilisé lors de votre achat pour retrouver vos commandes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            className="flex-1 px-4 py-3 rounded-xl border border-ink/15 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-jungle-700 hover:bg-jungle-800 text-cream text-sm font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Rechercher'}
          </button>
        </form>

        {/* Résultats */}
        {searched && orders !== null && (
          orders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-ink/50 text-sm">
                Aucune commande trouvée pour cet email.
              </p>
              <p className="text-ink/40 text-xs mt-2">
                Une question ? Écrivez-nous à{' '}
                <a href="mailto:contact@islanddreams.re" className="underline hover:text-jungle-600">
                  contact@islanddreams.re
                </a>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-ink/40 mb-4">
                {orders.length} commande{orders.length > 1 ? 's' : ''} trouvée{orders.length > 1 ? 's' : ''}
              </p>
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )
        )}
      </div>
    </main>
  );
}
