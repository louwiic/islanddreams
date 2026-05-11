import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { TextilePositionForm } from '../TextilePositionForm';

type Props = { params: Promise<{ id: string }> };

export default async function EditTextilePage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('textile_highlights' as never)
    .select('id, position, is_active, product:product_id(name, slug)')
    .eq('id', id)
    .single();

  if (!data) notFound();

  const item = data as unknown as {
    id: string;
    position: number;
    is_active: boolean;
    product: { name: string; slug: string };
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-1">Modifier</h1>
      <p className="text-sm text-gray-500 mb-6">{item.product.name}</p>
      <TextilePositionForm
        id={item.id}
        position={item.position}
        isActive={item.is_active}
      />
    </div>
  );
}
