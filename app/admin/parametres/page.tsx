import { Store, Truck } from 'lucide-react';

export default function ParametresPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      {/* Boutique */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <Store size={18} className="text-jungle-600" />
          <h2 className="font-semibold text-ink">Boutique</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la boutique
            </label>
            <input
              type="text"
              defaultValue="Island Dreams"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email de contact
            </label>
            <input
              type="email"
              defaultValue="contact@islanddreams.re"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              defaultValue="+262 692 XX XX XX"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <textarea
              rows={2}
              defaultValue="XX rue Example, 97400 Saint-Denis, La Réunion"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 resize-none"
            />
          </div>
        </div>
      </section>

      {/* Livraison */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <Truck size={18} className="text-ocean-600" />
          <h2 className="font-semibold text-ink">Livraison</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frais La Réunion
              </label>
              <input
                type="text"
                defaultValue="4,90 €"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frais Métropole
              </label>
              <input
                type="text"
                defaultValue="8,90 €"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Franco de port à partir de
            </label>
            <input
              type="text"
              defaultValue="49,00 €"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
            />
          </div>
        </div>
      </section>

      {/* Enregistrer */}
      <div className="flex justify-end">
        <button className="px-6 py-2.5 bg-jungle-600 text-white rounded-lg text-sm font-medium hover:bg-jungle-700 transition-colors">
          Enregistrer
        </button>
      </div>
    </div>
  );
}
