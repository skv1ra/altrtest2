create table if not exists public.altr_auth_rate_limits (
  id uuid primary key default gen_random_uuid(),
  action text not null check (action in ('register','login','forgot','reset')),
  identifier_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.altr_auth_rate_limits enable row level security;
revoke all on table public.altr_auth_rate_limits from anon, authenticated;
create index if not exists altr_auth_rate_limits_lookup_idx
  on public.altr_auth_rate_limits(action, identifier_hash, created_at desc);

drop policy if exists "Deny direct auth rate limit access" on public.altr_auth_rate_limits;
create policy "Deny direct auth rate limit access"
on public.altr_auth_rate_limits
for all
to anon, authenticated
using (false)
with check (false);

alter table public.altr_consents
  add column if not exists locale text,
  add column if not exists ip_address inet,
  add column if not exists user_agent text,
  add column if not exists withdrawn_at timestamptz,
  add column if not exists withdrawal_reason text,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.altr_consent_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_id uuid references public.altr_consents(id) on delete set null,
  event_type text not null check (event_type in ('accepted','withdrawn','updated')),
  policy_version text not null,
  terms_accepted boolean not null default false,
  conversation_processing_accepted boolean not null default false,
  ai_memory_accepted boolean not null default false,
  locale text,
  ip_address inet,
  user_agent text,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.altr_consent_history enable row level security;
revoke all on table public.altr_consent_history from anon;
grant select on table public.altr_consent_history to authenticated;

drop policy if exists "Users can read own consent history" on public.altr_consent_history;
create policy "Users can read own consent history"
on public.altr_consent_history
for select
to authenticated
using ((select auth.uid()) = user_id);
