import type { Metadata } from 'next';
import { ReviewForm } from './ReviewForm';
import { createAdminClient } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: 'Donnez votre avis — Island Dreams',
  description: 'Partagez votre expérience avec Island Dreams. Votre avis compte !',
  alternates: { canonical: '/avis' },
};

async function getApprovedReviews() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('reviews' as never)
    .select('id, customer_name, rating, comment, created_at')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(10);
  return (data ?? []) as { id: string; customer_name: string; rating: number; comment: string; created_at: string }[];
}

export default async function AvisPage() {
  const reviews = await getApprovedReviews();

  return (
    <main>
      <div className="bg-jungle-800 pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h1 className="font-[family-name:var(--font-oswald)] text-3xl md:text-4xl font-bold text-cream uppercase tracking-wide">
            Votre avis compte
          </h1>
          <p className="text-jungle-200 text-sm mt-2">
            Partagez votre expérience avec Island Dreams
          </p>
        </div>
      </div>

      <div className="bg-cream py-12 px-6">
        <div className="max-w-2xl mx-auto space-y-12">
          {/* Formulaire */}
          <ReviewForm />

          {/* Avis approuvés */}
          {reviews.length > 0 && (
            <div>
              <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-ink uppercase tracking-wide mb-6 text-center">
                Ce que nos clients disent
              </h2>
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-jungle-100 flex items-center justify-center text-sm font-bold text-jungle-700">
                          {r.customer_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-ink">{r.customer_name}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={`text-sm ${s <= r.rating ? 'text-sun-400' : 'text-gray-200'}`}>&#9733;</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
