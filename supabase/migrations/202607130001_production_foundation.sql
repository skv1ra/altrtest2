-- Altr production SaaS foundation.
-- Apply in Supabase SQL editor or through Supabase CLI after creating the project.

create extension if not exists pgcrypto;

create table if not exists public.altr_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  altr_name text not null default 'My Altr',
  role text not null default 'Founder',
  bio text not null default 'Altr learns from approved conversation imports and drafts replies only after explicit user action.',
  tone text not null default 'balanced' check (tone in ('balanced','warm','direct','formal')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.altr_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  policy_version text not null,
  terms_accepted_at timestamptz,
  conversation_processing_accepted_at timestamptz,
  ai_memory_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.altr_conversation_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('manual','telegram','gmail','whatsapp','instagram','messenger','slack','discord')),
  source_name text not null,
  source_hash text not null,
  status text not null default 'queued' check (status in ('queued','processing','completed','failed','deleted')),
  bytes integer not null default 0,
  conversations integer not null default 0,
  messages integer not null default 0,
  preview jsonb not null default '[]'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.altr_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  import_id uuid references public.altr_conversation_imports(id) on delete set null,
  category text not null default 'Communication',
  title text not null,
  description text not null,
  confidence numeric(5,2) not null default 0 check (confidence >= 0 and confidence <= 1),
  source_reference text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.altr_draft_replies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_text text not null,
  tone text not null default 'balanced' check (tone in ('balanced','warm','direct','formal')),
  draft_text text not null,
  model text,
  status text not null default 'draft' check (status in ('draft','approved','discarded')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create table if not exists public.altr_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('free','personal','work')),
  status text not null check (status in ('inactive','active','past_due','cancelled','expired')),
  provider text not null default 'lemon_squeezy',
  lemon_squeezy_customer_id text,
  lemon_squeezy_subscription_id text unique,
  lemon_squeezy_order_id text,
  variant_id text,
  renews_at timestamptz,
  ends_at timestamptz,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.altr_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references public.altr_subscriptions(id) on delete set null,
  provider text not null default 'lemon_squeezy',
  lemon_squeezy_order_id text unique,
  amount integer not null default 0,
  currency text not null default 'USD',
  status text not null check (status in ('paid','pending','failed','refunded')),
  receipt_url text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.altr_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.altr_profiles enable row level security;
alter table public.altr_consents enable row level security;
alter table public.altr_conversation_imports enable row level security;
alter table public.altr_memories enable row level security;
alter table public.altr_draft_replies enable row level security;
alter table public.altr_subscriptions enable row level security;
alter table public.altr_invoices enable row level security;
alter table public.altr_audit_logs enable row level security;

drop policy if exists profiles_owner_all on public.altr_profiles;
create policy profiles_owner_all on public.altr_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists consents_owner_select on public.altr_consents;
create policy consents_owner_select on public.altr_consents for select using (auth.uid() = user_id);

drop policy if exists imports_owner_all on public.altr_conversation_imports;
create policy imports_owner_all on public.altr_conversation_imports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists memories_owner_all on public.altr_memories;
create policy memories_owner_all on public.altr_memories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists drafts_owner_all on public.altr_draft_replies;
create policy drafts_owner_all on public.altr_draft_replies for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists subscriptions_owner_select on public.altr_subscriptions;
create policy subscriptions_owner_select on public.altr_subscriptions for select using (auth.uid() = user_id);

drop policy if exists invoices_owner_select on public.altr_invoices;
create policy invoices_owner_select on public.altr_invoices for select using (auth.uid() = user_id);

drop policy if exists audit_owner_select on public.altr_audit_logs;
create policy audit_owner_select on public.altr_audit_logs for select using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.altr_profiles;
create trigger set_profiles_updated_at before update on public.altr_profiles for each row execute function public.set_updated_at();

drop trigger if exists set_memories_updated_at on public.altr_memories;
create trigger set_memories_updated_at before update on public.altr_memories for each row execute function public.set_updated_at();

drop trigger if exists set_subscriptions_updated_at on public.altr_subscriptions;
create trigger set_subscriptions_updated_at before update on public.altr_subscriptions for each row execute function public.set_updated_at();
