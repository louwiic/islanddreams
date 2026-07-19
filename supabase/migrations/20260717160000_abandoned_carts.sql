create table if not exists public.abandoned_carts (
  id uuid primary key default gen_random_uuid(),
  recovery_token uuid not null unique default gen_random_uuid(),
  email text not null,
  customer_name text,
  items jsonb not null default '[]'::jsonb,
  cart_total numeric(12, 2) not null default 0,
  consent_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'sending', 'completed', 'cancelled', 'expired')),
  reminder_count integer not null default 0 check (reminder_count between 0 and 2),
  next_reminder_at timestamptz,
  last_reminder_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '72 hours'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists abandoned_carts_due_idx
  on public.abandoned_carts (next_reminder_at)
  where status = 'active';

create index if not exists abandoned_carts_email_idx
  on public.abandoned_carts (lower(email), created_at desc);

alter table public.abandoned_carts enable row level security;

comment on table public.abandoned_carts is 'Paniers enregistrés avec consentement pour une séquence maximale de deux rappels.';
