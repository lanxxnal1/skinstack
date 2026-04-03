-- Initial SkinStack schema
-- Created: 2026-03-30

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  routine text not null default 'Both' check (routine in ('Morning', 'Evening', 'Both')),
  photo_url text,
  start_date date not null,
  created_at timestamptz not null default now(),
  duration integer,
  size_value numeric,
  size_unit text check (size_unit in ('ml', 'g', 'oz')),
  initial_remaining integer not null default 100,
  has_backup boolean not null default false
);

create table if not exists finished_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  photo_url text,
  start_date date not null,
  finish_date date not null,
  actual_duration integer not null,
  rating text check (rating in ('loved', 'ok', 'wont-repurchase')),
  created_at timestamptz not null default now()
);

create table if not exists duration_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_name text not null,
  category text not null,
  duration integer not null,
  created_at timestamptz not null default now()
);

-- Row level security
alter table products enable row level security;
alter table finished_products enable row level security;
alter table duration_history enable row level security;

create policy "Users can manage their own products"
  on products for all using (auth.uid() = user_id);

create policy "Users can manage their own finished products"
  on finished_products for all using (auth.uid() = user_id);

create policy "Users can manage their own duration history"
  on duration_history for all using (auth.uid() = user_id);
