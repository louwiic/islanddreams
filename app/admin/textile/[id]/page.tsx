import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { TextilePositionForm } from '../TextilePositionForm';

type Props = { params: Promise<{ id: string }> };

export default async function EditTextilePage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('textile_highlights' as never)
    .select('id, position, is_active, image_url, product:product_id(name, slug, product_images(id, url, is_main, position, alt))')
    .eq('id', id)
    .single();

  if (!data) notFound();

  const item = data as unknown as {
    id: string;
    position: number;
    is_active: boolean;
    image_url: string | null;
    product: {
      name: string;
      slug: string;
      product_images: { id: string; url: string; is_main: boolean; position: number; alt: string | null }[];
    };
  };

  const images = (item.product.product_images ?? []).sort((a, b) => {
    if (a.is_main) return -1;
    if (b.is_main) return 1;
    return a.position - b.position;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-1">Modifier</h1>
      <p className="text-sm text-gray-500 mb-6">{item.product.name}</p>
      <TextilePositionForm
        id={item.id}
        position={item.position}
        isActive={item.is_active}
        images={images}
        currentImageUrl={item.image_url}
      />
    </div>
  );
}
