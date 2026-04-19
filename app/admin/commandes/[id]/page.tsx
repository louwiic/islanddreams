import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, MapPin, User, CreditCard } from 'lucide-react';
import { getOrderById } from '@/lib/actions/orders';
import { OrderStatusUpdater } from '@/components/admin/OrderStatusUpdater';

type PageProps = { params: Promise<{ id: string }> };

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  const customer = order.customers as any;
  const shipping = order.shipping_address as any;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/commandes"
          className="p-2 rounded-lg hover:bg-gray-200/50 transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-500" />
        </Link>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-ink">
            {order.order_number}
          </h2>
          <p className="text-sm text-gray-400">
            {order.created_at
              ? new Date(order.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </p>
        </div>
        <OrderStatusUpdater
          orderId={order.id}
          currentStatus={order.status ?? 'pending'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Articles */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Package size={16} className="text-gray-400" />
            <h3 className="font-semibold text-ink">
              Articles ({order.items.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {order.items.map((item: any) => (
              <div
                key={item.id}
                className="px-5 py-3 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">
                    {item.product_name}
                  </p>
                  {item.variant_label && (
                    <p className="text-xs text-gray-400">{item.variant_label}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {item.unit_price.toFixed(2)} € x {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium text-ink">
                  {item.total.toFixed(2)} €
                </p>
              </div>
            ))}
          </div>
          {/* Totaux */}
          <div className="px-5 py-4 border-t border-gray-100 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Sous-total</span>
              <span>{order.subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Livraison</span>
              <span>{(order.shipping_cost ?? 0).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-base font-bold text-ink pt-1.5 border-t border-gray-100">
              <span>Total</span>
              <span>{order.total.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <h3 className="font-semibold text-ink">Client</h3>
            </div>
            <div className="p-5 space-y-2 text-sm">
              {customer ? (
                <>
                  <p className="font-medium text-ink">
                    {customer.first_name} {customer.last_name}
                  </p>
                  <p className="text-gray-500">{customer.email}</p>
                  {customer.phone && (
                    <p className="text-gray-500">{customer.phone}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-400 italic">Client anonyme</p>
              )}
            </div>
          </div>

          {/* Livraison */}
          {shipping && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <h3 className="font-semibold text-ink">Livraison</h3>
              </div>
              <div className="p-5 text-sm text-gray-600 space-y-0.5">
                {shipping.name && <p className="font-medium text-ink">{shipping.name}</p>}
                <p>{shipping.line1}</p>
                {shipping.line2 && <p>{shipping.line2}</p>}
                <p>
                  {shipping.postal_code} {shipping.city}
                </p>
                <p>{shipping.country}</p>
              </div>
            </div>
          )}

          {/* Paiement */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <CreditCard size={16} className="text-gray-400" />
              <h3 className="font-semibold text-ink">Paiement</h3>
            </div>
            <div className="p-5 text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Stripe session</span>
                <span className="text-xs text-gray-400 font-mono truncate max-w-[160px]">
                  {order.stripe_session_id || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Statut</span>
                <span className="text-jungle-600 font-medium">
                  {STATUS_LABELS[order.status ?? 'pending']}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
