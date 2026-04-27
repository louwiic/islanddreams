import Link from 'next/link';
import { CheckCircle, ShoppingBag, ArrowRight, MapPin } from 'lucide-react';
import { getStripeClient } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';
import { CartClearer } from './CartClearer';
import type Stripe from 'stripe';

async function fetchSession(sessionId: string) {
  try {
    const stripe = getStripeClient();
    return await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'line_items.data.price.product'],
    });
  } catch {
    return null;
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const session = session_id ? await fetchSession(session_id) : null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  const shipping = (session as any)?.shipping_details;
  const lineItems = session?.line_items?.data ?? [];
  const total = session?.amount_total ? (session.amount_total / 100).toFixed(2) : null;

  return (
    <main className="bg-cream min-h-screen">
      <CartClearer />
      {/* Bandeau sombre pour que la navbar transparente soit lisible */}
      <div className="bg-jungle-800 pt-24 pb-8" />
      <div className="px-4 pt-10 pb-16">

      <div className="max-w-xl mx-auto">
        {/* Icône succès */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-jungle-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-jungle-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-ink">
            Merci pour votre commande&nbsp;!
          </h1>
          <p className="mt-3 text-ink/60 leading-relaxed">
            Votre paiement a été confirmé. Vous recevrez un email de confirmation
            avec le suivi de livraison.
          </p>
        </div>

        {/* Récap commande */}
        {lineItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-ink/8 overflow-hidden mb-5">
            <div className="px-5 py-4 border-b border-ink/8">
              <h2 className="font-semibold text-ink text-sm uppercase tracking-wider">
                Récapitulatif
              </h2>
            </div>
            <ul className="divide-y divide-ink/6">
              {lineItems.map((li) => {
                const product = li.price?.product as Stripe.Product | undefined;
                const variantLabel = product?.metadata?.variantLabel;
                return (
                  <li key={li.id} className="px-5 py-3 flex justify-between items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {product?.name || li.description || 'Article'}
                        {variantLabel && (
                          <span className="text-ink/50 font-normal"> — {variantLabel}</span>
                        )}
                      </p>
                      {(li.quantity ?? 1) > 1 && (
                        <p className="text-xs text-ink/40 mt-0.5">Qté : {li.quantity}</p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-ink shrink-0">
                      {((li.amount_total ?? 0) / 100).toFixed(2)} €
                    </span>
                  </li>
                );
              })}
            </ul>
            {total && (
              <div className="px-5 py-4 bg-jungle-50 flex justify-between items-center">
                <span className="font-bold text-ink">Total payé</span>
                <span className="font-black text-jungle-700 text-lg">{total} €</span>
              </div>
            )}
          </div>
        )}

        {/* Adresse de livraison */}
        {shipping?.address && (
          <div className="bg-white rounded-2xl shadow-sm border border-ink/8 px-5 py-4 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={15} className="text-jungle-600" />
              <h2 className="font-semibold text-ink text-sm uppercase tracking-wider">
                Livraison
              </h2>
            </div>
            <p className="text-sm text-ink/70 leading-relaxed">
              {shipping.name && <span className="block font-medium text-ink">{shipping.name}</span>}
              {shipping.address.line1}
              {shipping.address.line2 && `, ${shipping.address.line2}`}
              <br />
              {shipping.address.postal_code} {shipping.address.city}
              <br />
              {shipping.address.country}
            </p>
          </div>
        )}

        {/* Compte — adapté selon l'état de connexion */}
        {isLoggedIn ? (
          <div className="p-5 bg-jungle-50 border border-jungle-200 rounded-2xl text-center mb-4">
            <p className="text-sm font-medium text-jungle-800">
              Commande enregistrée dans votre compte
            </p>
            <Link
              href="/compte"
              className="mt-3 inline-block px-4 py-2 bg-jungle-700 text-cream text-xs font-bold rounded-lg hover:bg-jungle-800 transition-colors"
            >
              Voir mes commandes
            </Link>
          </div>
        ) : (
          <div className="p-5 bg-jungle-50 border border-jungle-200 rounded-2xl text-center mb-4">
            <p className="text-sm font-medium text-jungle-800">
              Retrouvez vos commandes facilement
            </p>
            <p className="text-xs text-jungle-600 mt-1 mb-3">
              Créez un compte avec votre email — vos achats y seront automatiquement liés.
            </p>
            <Link
              href="/compte/connexion"
              className="inline-block px-4 py-2 bg-jungle-700 text-cream text-xs font-bold rounded-lg hover:bg-jungle-800 transition-colors"
            >
              Créer mon compte
            </Link>
          </div>
        )}

        {/* Message péi */}
        <div className="p-5 bg-jungle-600 rounded-2xl text-center mb-8">
          <p className="text-cream font-medium text-sm">
            Un bout de péi est en route vers chez vous. 🌺
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/boutique"
            className="flex items-center gap-2 px-6 py-3 bg-jungle-700 text-cream text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-jungle-800 transition-colors"
          >
            <ShoppingBag size={16} />
            Continuer mes achats
          </Link>
          <Link
            href="/mes-commandes"
            className="flex items-center gap-2 px-6 py-3 text-sm text-ink/60 hover:text-ink transition-colors"
          >
            Voir mes commandes
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
      </div>
    </main>
  );
}
