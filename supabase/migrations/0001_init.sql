create table if not exists products (
  id text primary key,
  name text not null,
  category text not null,
  price_inr int not null,
  tags text[] default '{}',
  starter boolean default false
);

create table if not exists occasions (
  id text primary key,
  label text not null,
  signal_tags text[] not null,
  target_categories text[] not null
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  comfort int default 50,
  -- categories the session already shopped; adoption only counts outside this
  baseline text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists adoption_events (
  id bigserial primary key,
  session_id uuid references sessions(id) on delete cascade,
  product_id text references products(id),
  category text not null,
  event text not null check (event in ('suggested','tried','repeat')),
  occasion_id text,
  created_at timestamptz default now()
);

create index if not exists adoption_events_session_idx on adoption_events (session_id);

-- Demo app talks to Postgres only through the service-role key, so lock the
-- anon role out entirely.
alter table sessions enable row level security;
alter table adoption_events enable row level security;
