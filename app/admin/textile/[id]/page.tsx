import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { TextileForm } from '../TextileForm';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditTextilePage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('textile_highlights' as never)
    .select('*')
    .eq('id', id)
    .single();

  if (!data) notFound();

  const item = data as Record<string, unknown>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Modifier le produit textile</h1>
      <TextileForm
        initialData={{
          id: item.id as string,
          product_name: item.product_name as string,
          image_url: item.image_url as string,
          product_link: (item.product_link as string) ?? '/boutique',
          position: (item.position as number) ?? 0,
          is_active: (item.is_active as boolean) ?? true,
        }}
      />
    </div>
  );
}
