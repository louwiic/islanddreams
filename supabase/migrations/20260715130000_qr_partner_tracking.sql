create table if not exists public.qr_events (
  id bigint generated always as identity primary key,
  campaign_id text not null,
  event_type text not null check (event_type in ('scan', 'page_view')),
  path text,
  created_at timestamptz not null default now()
);

create index if not exists qr_events_campaign_created_idx
  on public.qr_events (campaign_id, created_at desc);

create table if not exists public.qr_partner_conversions (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null,
  partner_email text not null,
  order_id uuid not null references public.orders(id) on delete cascade,
  stripe_session_id text not null unique,
  order_total numeric(12, 2) not null check (order_total >= 0),
  commission_rate numeric(5, 2) not null check (commission_rate > 0 and commission_rate <= 100),
  commission_amount numeric(12, 2) not null check (commission_amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'cancelled', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists qr_partner_conversions_campaign_created_idx
  on public.qr_partner_conversions (campaign_id, created_at desc);

create index if not exists qr_partner_conversions_partner_email_idx
  on public.qr_partner_conversions (lower(partner_email));

alter table public.qr_events enable row level security;
alter table public.qr_partner_conversions enable row level security;

comment on table public.qr_events is 'Événements anonymes du parcours provenant des QR partenaires.';
comment on table public.qr_partner_conversions is 'Attribution locale des commandes et commissions aux partenaires QR.';
