create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  recipient_phone text not null,
  bundle_gb integer not null check (bundle_gb > 0),
  amount_tzs integer not null check (amount_tzs > 0),
  transaction_code text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Completed')),
  customer_feedback text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text unique not null,
  password_hash text,
  referral_code text unique not null,
  points integer not null default 0 check (points >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.customer_feedback (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.business_settings (
  id boolean primary key default true check (id),
  business_name text not null default 'MACHA 255 DATA HUB',
  tagline text not null default 'Data inayokwenda na wewe.',
  announcement text,
  payment_number text not null,
  payment_name text not null,
  min_custom_gb integer not null default 1,
  max_custom_gb integer not null default 100,
  custom_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.customers enable row level security;
alter table public.customer_feedback enable row level security;
alter table public.business_settings enable row level security;
-- For production, replace these policies with authenticated seller policies
-- and an Edge Function for public order creation.
create policy "public can create orders" on public.orders
  for insert to anon with check (true);
create policy "authenticated sellers can read orders" on public.orders
  for select to authenticated using (true);
create policy "authenticated sellers can update orders" on public.orders
  for update to authenticated using (true) with check (true);

create policy "customers can read their own profile" on public.customers
  for select to authenticated using (auth.uid() = id);
create policy "customers can read feedback" on public.customer_feedback
  for select to authenticated using (auth.uid() = customer_id);
create policy "customers can add feedback" on public.customer_feedback
  for insert to authenticated with check (auth.uid() = customer_id);
create policy "public can read business settings" on public.business_settings
  for select to anon using (true);
create policy "authenticated sellers can manage settings" on public.business_settings
  for all to authenticated using (true) with check (true);

alter publication supabase_realtime add table public.orders;

create index if not exists orders_recipient_phone_idx on public.orders (recipient_phone);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
