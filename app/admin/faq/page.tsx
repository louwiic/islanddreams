import { createAdminClient } from '@/lib/supabase/admin';
import { FaqAdminList } from './FaqAdminList';

async function getFaqs() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('site_faqs' as never)
    .select('*')
    .order('position');
  return (data ?? []) as { id: string; question: string; answer: string; position: number; is_active: boolean; created_at: string }[];
}

export default async function FaqAdminPage() {
  const faqs = await getFaqs();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-ink">FAQ</h1>
        <p className="text-sm text-gray-500 mt-1">Questions fréquentes affichées sur la page d&apos;accueil</p>
      </div>
      <FaqAdminList initialFaqs={faqs} />
    </div>
  );
}
