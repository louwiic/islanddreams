import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { BannerForm } from '../BannerForm';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditBannerPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('hero_banners' as never)
    .select('*')
    .eq('id', id)
    .single();

  if (!data) notFound();

  const banner = data as Record<string, unknown>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Modifier la bannière</h1>
      <BannerForm
        initialData={{
          id: banner.id as string,
          title: banner.title as string,
          subtitle: (banner.subtitle as string) ?? '',
          image_url: (banner.image_url as string) ?? '',
          cta_text: (banner.cta_text as string) ?? 'Découvrir',
          cta_link: (banner.cta_link as string) ?? '/boutique',
          start_date: banner.start_date as string,
          end_date: banner.end_date as string,
          priority: (banner.priority as number) ?? 0,
          is_active: (banner.is_active as boolean) ?? true,
        }}
      />
    </div>
  );
}
