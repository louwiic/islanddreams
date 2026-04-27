import Link from 'next/link';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <main className="bg-cream min-h-screen">
      <div className="bg-jungle-800 pt-24 pb-8" />
      <div className="px-4 pt-10 pb-16">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-coral-50 flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-coral-500" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-ink">
          Commande annulée
        </h1>

        <p className="mt-4 text-gray-600 leading-relaxed">
          Pas de souci — votre panier est toujours là.
          Vous pouvez reprendre votre commande quand vous voulez.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/boutique"
            className="flex items-center gap-2 px-6 py-3 bg-jungle-700 text-cream text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-jungle-800 transition-colors"
          >
            <ShoppingBag size={16} />
            Retour à la boutique
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 text-sm text-gray-600 hover:text-ink transition-colors"
          >
            <ArrowLeft size={14} />
            Accueil
          </Link>
        </div>
      </div>
      </div>
    </main>
  );
}
