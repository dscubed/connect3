-- Membership receipt verification for Connect3.
-- Adapted from the ticketing clone implementation. Organisation profiles own
-- their own membership product config in this app.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception
      using
        errcode = '42P01',
        message = 'Missing required table public.profiles',
        detail = 'Membership verification depends on existing Connect3 profiles.';
  end if;
end
$$;

create table if not exists public.club_membership_products (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.profiles(id) on delete cascade,
  product_name text not null default '',
  normalized_product_name text not null default '',
  enabled boolean not null default true,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint club_membership_products_club_id_key unique (club_id)
);

create table if not exists public.membership_email_bindings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  verified_email text not null,
  dkim_domain text not null,
  dkim_selector text,
  first_message_id text,
  first_verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint membership_email_bindings_user_id_key unique (user_id)
);

create table if not exists public.club_memberships (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  verified_email text not null,
  matched_product_name text not null,
  matched_receipt_item_name text not null,
  dkim_domain text not null,
  dkim_selector text,
  message_id text,
  receipt_subject text,
  receipt_sent_at timestamptz,
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint club_memberships_club_user_key unique (club_id, user_id)
);

create index if not exists club_membership_products_enabled_idx
  on public.club_membership_products(enabled)
  where enabled = true;

create index if not exists club_memberships_user_id_idx
  on public.club_memberships(user_id);

create index if not exists club_memberships_club_id_idx
  on public.club_memberships(club_id);

create unique index if not exists membership_email_bindings_verified_email_lower_key
  on public.membership_email_bindings(lower(verified_email));

alter table public.club_membership_products enable row level security;
alter table public.membership_email_bindings enable row level security;
alter table public.club_memberships enable row level security;

drop policy if exists "organisation manages own membership product"
  on public.club_membership_products;
create policy "organisation manages own membership product"
  on public.club_membership_products
  for all
  using (club_id = auth.uid())
  with check (club_id = auth.uid());

drop policy if exists "users read own membership email binding"
  on public.membership_email_bindings;
create policy "users read own membership email binding"
  on public.membership_email_bindings
  for select
  using (user_id = auth.uid());

drop policy if exists "users read own memberships"
  on public.club_memberships;
create policy "users read own memberships"
  on public.club_memberships
  for select
  using (user_id = auth.uid());

drop policy if exists "organisation reads own verified memberships"
  on public.club_memberships;
create policy "organisation reads own verified memberships"
  on public.club_memberships
  for select
  using (club_id = auth.uid());
