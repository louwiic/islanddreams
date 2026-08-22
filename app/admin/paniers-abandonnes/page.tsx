import { Clock, Mail, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { getAbandonedCarts, type AbandonedCartRow } from '@/lib/actions/abandoned-carts';
import { AbandonedCartActions } from '@/components/admin/AbandonedCartActions';

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  sending: 'Envoi',
  completed: 'Converti',
  cancelled: 'Annulé',
  expired: 'Expiré',
};

const STATUS_CLASSES: Record<string, string> = {
  active: 'bg-jungle-50 text-jungle-700',
  sending: 'bg-sun-50 text-sun-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-gray-100 text-gray-500',
  expired: 'bg-red-50 text-red-600',
};

function formatDate(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function itemSummary(cart: AbandonedCartRow) {
  return cart.items
    .slice(0, 3)
    .map((item) => `${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ''} x${item.quantity}`)
    .join(', ');
}

export default async function AbandonedCartsPage() {
  const { carts, stats } = await getAbandonedCarts();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-400">Paniers suivis</p>
          <p className="mt-1 text-2xl font-bold text-ink">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-400">Actifs</p>
          <p className="mt-1 text-2xl font-bold text-jungle-600">{stats.active}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-400">Valeur active</p>
          <p className="mt-1 text-2xl font-bold text-sun-600">{stats.activeValue.toFixed(2)} €</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-400">Convertis</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{stats.completed}</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">Relances panier abandonné</h2>
          <p className="mt-1 text-xs text-gray-500">
            Séquence consentie : rappel après 2 h, puis dernier rappel 22 h plus tard. Seuil minimum : 10 €.
          </p>
        </div>

        {carts.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <ShoppingBag className="mx-auto mb-3 text-gray-300" size={38} />
            <p className="text-sm text-gray-400">Aucun panier abandonné enregistré.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Panier</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Rappels</th>
                  <th className="px-4 py-3 font-medium">Prochain</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {carts.map((cart) => (
                  <tr key={cart.id} className="align-top">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-jungle-50 text-jungle-700">
                          <Mail size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">
                            {cart.customer_name || 'Client'}
                          </p>
                          <a href={`mailto:${cart.email}`} className="text-xs text-gray-500 hover:text-jungle-700">
                            {cart.email}
                          </a>
                          <p className="mt-1 text-[11px] text-gray-400">Créé le {formatDate(cart.created_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-sm px-4 py-4">
                      <p className="line-clamp-2 text-sm text-gray-600">{itemSummary(cart) || 'Panier vide'}</p>
                      {cart.items.length > 3 && (
                        <p className="mt-1 text-xs text-gray-400">+{cart.items.length - 3} article(s)</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-ink">{cart.cart_total.toFixed(2)} €</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASSES[cart.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {STATUS_LABELS[cart.status] ?? cart.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        {cart.status === 'completed' ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Clock size={14} />}
                        {cart.reminder_count}/2
                      </div>
                      <p className="mt-1 text-xs text-gray-400">Dernier : {formatDate(cart.last_reminder_at)}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{formatDate(cart.next_reminder_at)}</td>
                    <td className="px-5 py-4 text-right">
                      <AbandonedCartActions id={cart.id} status={cart.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

