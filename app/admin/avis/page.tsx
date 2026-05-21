import { createAdminClient } from '@/lib/supabase/admin';
import { ReviewsAdmin } from './ReviewsAdmin';

async function getReviews() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('reviews' as never)
    .select('*')
    .order('created_at', { ascending: false });
  return (data ?? []) as {
    id: string;
    customer_name: string;
    customer_email: string | null;
    rating: number;
    comment: string;
    is_approved: boolean;
    order_number: string | null;
    created_at: string;
  }[];
}

export default async function AvisAdminPage() {
  const reviews = await getReviews();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Avis clients</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez les avis — approuvez pour les afficher sur le site</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-3 py-2">
          <p className="text-xs text-gray-400">Lien à partager</p>
          <p className="text-sm font-mono text-jungle-600">islanddreams.re/avis</p>
        </div>
      </div>
      <ReviewsAdmin initialReviews={reviews} />
    </div>
  );
}
