create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  phone text not null,
  bundle_gb integer not null check (bundle_gb > 0),
  amount_tzs integer not null check (amount_tzs > 0),
  transaction_code text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Completed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.orders enable row level security;
-- For production, replace these policies with authenticated seller policies
-- and an Edge Function for public order creation.
create policy "public can create orders" on public.orders
  for insert to anon with check (true);
create policy "authenticated sellers can read orders" on public.orders
  for select to authenticated using (true);
create policy "authenticated sellers can update orders" on public.orders
  for update to authenticated using (true) with check (true);

alter publication supabase_realtime add table public.orders;
