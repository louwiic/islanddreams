alter table public.product_variants
add column if not exists image_id uuid null references public.product_images(id) on delete set null;

