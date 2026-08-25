alter table public.product_images
alter column id set default gen_random_uuid();
