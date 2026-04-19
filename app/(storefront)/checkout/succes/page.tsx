'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/cart/CartProvider';

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();

  // Vider le panier après paiement réussi
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="pt-28 pb-16 px-4">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-jungle-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-jungle-600" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-ink">
          Merci pour votre commande !
        </h1>

        <p className="mt-4 text-gray-600 leading-relaxed">
          Votre paiement a été confirmé. Vous recevrez un email de confirmation
          avec le détail de votre commande et le suivi de livraison.
        </p>

        <div className="mt-8 p-5 bg-jungle-50 rounded-xl">
          <p className="text-sm text-jungle-700 font-medium">
            Un bout de péi est en route vers chez vous.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/boutique"
            className="flex items-center gap-2 px-6 py-3 bg-jungle-700 text-cream text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-jungle-800 transition-colors"
          >
            <ShoppingBag size={16} />
            Continuer mes achats
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 text-sm text-gray-600 hover:text-ink transition-colors"
          >
            Retour à l&apos;accueil
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );
}
