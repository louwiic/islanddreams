import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, MapPin, User, CreditCard, ExternalLink, FileText } from 'lucide-react';
import { getOrderById } from '@/lib/actions/orders';
import { OrderStatusUpdater } from '@/components/admin/OrderStatusUpdater';
import { getStripeClient } from '@/lib/stripe/client';
import type Stripe from 'stripe';

type PageProps = { params: Promise<{ id: string }> };

type OrderCustomer = {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
};

type OrderShippingAddress = {
  name?: string | null;
  line1?: string | null;
  line2?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
  phone?: string | null;
};

type OrderItem = {
  id: string;
  product_name: string;
  variant_label?: string | null;
  unit_price: number;
  quantity: number;
  total: number;
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

type StripeBillingLink = {
  invoiceUrl: string | null;
  invoicePdf: string | null;
  receiptUrl: string | null;
  label: string;
};

async function getStripeBillingLink(sessionId: string | null): Promise<StripeBillingLink | null> {
  if (!sessionId || !process.env.STRIPE_SECRET_KEY) return null;

  try {
    const session = await getStripeClient().checkout.sessions.retrieve(sessionId, {
      expand: ['invoice', 'payment_intent.latest_charge'],
    });

    const invoice =
      typeof session.invoice === 'object' && session.invoice
        ? session.invoice
        : null;
    const paymentIntent =
      typeof session.payment_intent === 'object' && session.payment_intent
        ? session.payment_intent
        : null;
    const latestCharge =
      paymentIntent &&
      typeof paymentIntent.latest_charge === 'object' &&
      paymentIntent.latest_charge
        ? (paymentIntent.latest_charge as Stripe.Charge)
        : null;

    return {
      invoiceUrl: invoice?.hosted_invoice_url ?? null,
      invoicePdf: invoice?.invoice_pdf ?? null,
      receiptUrl: latestCharge?.receipt_url ?? null,
      label: invoice ? `Facture ${invoice.number ?? ''}`.trim() : 'Reçu Stripe',
    };
  } catch (error) {
    console.error('[Admin order Stripe billing]', error);
    return null;
  }
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  const customer = order.customers as OrderCustomer | null;
  const shipping = order.shipping_address as OrderShippingAddress | null;
  const billingLink = await getStripeBillingLink(order.stripe_session_id);

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
            {order.items.map((item: OrderItem) => (
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
                {shipping.phone && <p className="pt-2 text-ink">Tél : {shipping.phone}</p>}
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
              <div className="pt-3">
                {billingLink?.invoiceUrl || billingLink?.receiptUrl ? (
                  <div className="space-y-2">
                    <a
                      href={billingLink.invoiceUrl || billingLink.receiptUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg bg-jungle-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-jungle-800"
                    >
                      <FileText size={15} />
                      {billingLink.invoiceUrl ? 'Voir la facture Stripe' : 'Voir le reçu Stripe'}
                      <ExternalLink size={13} />
                    </a>
                    {billingLink.invoicePdf && (
                      <a
                        href={billingLink.invoicePdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        Télécharger le PDF
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-400">
                    Facture Stripe non disponible pour cette commande.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
