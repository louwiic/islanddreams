'use client';

import { useState, useTransition } from 'react';
import { Gift, Loader2, Save } from 'lucide-react';
import { updateSettings } from '@/lib/actions/settings';

type Props = {
  initialSettings: Record<string, string>;
  products: { id: string; name: string; slug: string; status: string | null }[];
};

export function GiftOfferSettings({ initialSettings, products }: Props) {
  const [enabled, setEnabled] = useState(initialSettings.gift_offer_enabled === 'true');
  const [minAmount, setMinAmount] = useState(initialSettings.gift_offer_min_amount || '50');
  const [productSlug, setProductSlug] = useState(initialSettings.gift_offer_product_slug || '');
  const [title, setTitle] = useState(
    initialSettings.gift_offer_title || 'Un cadeau vous attend'
  );
  const [description, setDescription] = useState(
    initialSettings.gift_offer_description ||
      'Ajoutez vos souvenirs préférés au panier et débloquez un cadeau offert.'
  );
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    setMessage('');
    startTransition(async () => {
      await updateSettings({
        gift_offer_enabled: String(enabled),
        gift_offer_min_amount: minAmount.trim(),
        gift_offer_product_slug: productSlug,
        gift_offer_title: title.trim(),
        gift_offer_description: description.trim(),
      });
      setMessage('Cadeau offert enregistré.');
    });
  };

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
        <Gift size={18} className="text-sun-600" />
        <h2 className="font-semibold text-ink">Cadeau offert</h2>
      </div>

      <div className="space-y-5 p-6">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="rounded border-gray-300 text-jungle-600 focus:ring-jungle-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Activer le cadeau automatique au-dessus d’un montant panier
          </span>
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Montant minimum panier (€)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={minAmount}
              onChange={(event) => setMinAmount(event.target.value)}
              placeholder="50"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Produit offert
            </label>
            <select
              value={productSlug}
              onChange={(event) => setProductSlug(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
            >
              <option value="">Choisir un produit</option>
              {products.map((product) => (
                <option key={product.id} value={product.slug}>
                  {product.name}
                  {product.status !== 'publish' ? ' (non publié)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Titre affiché
          </label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Texte affiché
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
          />
        </div>

        <p className="text-xs leading-relaxed text-gray-400">
          Le serveur vérifiera le montant depuis la base produits au moment du checkout. Le cadeau
          peut être non publié, mais il doit être en stock. Il sera ajouté à la commande à 0 € si le
          palier est atteint.
        </p>

        {message && <p className="text-sm text-jungle-600">{message}</p>}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-jungle-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-jungle-700 disabled:opacity-50"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Enregistrer le cadeau
          </button>
        </div>
      </div>
    </section>
  );
}
