import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { FaqFullList } from './FaqFullList';

export const metadata: Metadata = {
  title: 'FAQ — Island Dreams | Mi répon zot question',
  description:
    'Retrouvez les réponses aux questions les plus fréquentes sur Island Dreams : produits, commandes, livraison, paiement et retours.',
  alternates: { canonical: '/faq' },
};

async function getSiteFaqs() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('site_faqs' as never)
    .select('id, question, answer')
    .eq('is_active', true)
    .order('position');
  return (data ?? []) as { id: string; question: string; answer: string }[];
}

export default async function FaqPage() {
  const faqs = await getSiteFaqs();

  return (
    <main>
      <div className="bg-jungle-800 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="font-[family-name:var(--font-oswald)] text-3xl md:text-4xl font-bold text-cream uppercase tracking-wide">
            Mi répon zot question
          </h1>
          <p className="text-jungle-200 text-sm mt-2">
            Tout ce que vous devez savoir sur Island Dreams
          </p>
        </div>
      </div>

      <div className="bg-cream py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <FaqFullList items={faqs} />

          {/* Contact */}
          <div className="mt-12 text-center bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <p className="text-lg font-semibold text-ink mb-2">
              Vous n&apos;avez pas trouvé votre réponse ?
            </p>
            <p className="text-sm text-gray-500 mb-5">
              Notre équipe reste disponible pour vous accompagner.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <a href="mailto:contact@islanddreams.re" className="text-jungle-600 hover:text-jungle-700 font-medium">
                contact@islanddreams.re
              </a>
              <span className="hidden sm:inline text-gray-300">|</span>
              <a href="tel:+262693056667" className="text-jungle-600 hover:text-jungle-700 font-medium">
                0693 05 66 67
              </a>
              <span className="hidden sm:inline text-gray-300">|</span>
              <a href="/contact" className="inline-flex items-center gap-1 px-4 py-2 bg-jungle-600 hover:bg-jungle-700 text-white rounded-lg font-medium transition-colors">
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
