create extension if not exists vector with schema extensions;

create or replace function public.altr_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.altr_set_updated_at() from public;

alter table public.altr_profiles
  add column if not exists avatar_url text,
  add column if not exists locale text not null default 'uk-UA',
  add column if not exists onboarding_completed boolean not null default false;

create table if not exists public.altr_user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'system' check (theme in ('system','light','dark')),
  language text not null default 'uk',
  timezone text not null default 'UTC',
  default_tone text not null default 'balanced' check (default_tone in ('balanced','warm','direct','formal')),
  memory_learning_enabled boolean not null default true,
  email_notifications_enabled boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.altr_data_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  external_account_id text,
  display_name text,
  status text not null default 'disconnected' check (status in ('connected','disconnected','error','revoked')),
  scopes text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  connected_at timestamptz,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, provider, external_account_id)
);

create table if not exists public.altr_consent_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null,
  event_type text not null check (event_type in ('accepted','withdrawn','updated')),
  policy_version text not null,
  granted boolean not null,
  locale text,
  ip_address inet,
  user_agent text,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.altr_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  import_id uuid references public.altr_conversation_imports(id) on delete set null,
  data_connection_id uuid references public.altr_data_connections(id) on delete set null,
  external_conversation_id text,
  platform text not null default 'manual',
  title text,
  participant_summary jsonb not null default '[]'::jsonb,
  started_at timestamptz,
  last_message_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.altr_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.altr_conversations(id) on delete cascade,
  external_message_id text,
  sender_type text not null check (sender_type in ('user','contact','assistant','system')),
  sender_label text,
  content text not null,
  sent_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.altr_memories
  add column if not exists embedding extensions.vector(1536),
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.altr_memory_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  memory_id uuid not null references public.altr_memories(id) on delete cascade,
  conversation_id uuid references public.altr_conversations(id) on delete set null,
  message_id uuid references public.altr_messages(id) on delete set null,
  import_id uuid references public.altr_conversation_imports(id) on delete set null,
  source_type text not null check (source_type in ('conversation','message','import','manual','feedback')),
  source_reference text,
  excerpt text,
  created_at timestamptz not null default now()
);

create table if not exists public.altr_assistant_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  assistant_type text not null default 'custom' check (assistant_type in ('digital_twin','custom')),
  system_instructions text,
  tone text not null default 'balanced' check (tone in ('balanced','warm','direct','formal')),
  is_active boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.altr_assistant_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assistant_config_id uuid references public.altr_assistant_configs(id) on delete set null,
  conversation_id uuid references public.altr_conversations(id) on delete set null,
  input_text text not null,
  output_text text,
  model text,
  status text not null default 'draft' check (status in ('queued','running','draft','approved','discarded','failed')),
  error text,
  usage jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.altr_draft_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assistant_run_id uuid not null references public.altr_assistant_runs(id) on delete cascade,
  rating smallint check (rating between 1 and 5),
  action text check (action in ('approved','edited','discarded')),
  edited_text text,
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.altr_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_type text not null default 'full_account' check (request_type in ('full_account','selected_data')),
  status text not null default 'requested' check (status in ('requested','processing','completed','rejected','cancelled')),
  reason text,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.altr_audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  actor_type text not null default 'user' check (actor_type in ('user','service','system','admin')),
  event_type text not null,
  entity_type text,
  entity_id uuid,
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.altr_usage_counters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  metric text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  used_count bigint not null default 0 check (used_count >= 0),
  limit_count bigint check (limit_count is null or limit_count >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, metric, period_start, period_end)
);

insert into public.altr_consent_events (user_id, consent_type, event_type, policy_version, granted, locale, ip_address, user_agent, reason, created_at)
select user_id, 'terms', event_type, policy_version, terms_accepted, locale, ip_address, user_agent, reason, created_at
from public.altr_consent_history
on conflict do nothing;

insert into public.altr_consent_events (user_id, consent_type, event_type, policy_version, granted, locale, ip_address, user_agent, reason, created_at)
select user_id, 'conversation_processing', event_type, policy_version, conversation_processing_accepted, locale, ip_address, user_agent, reason, created_at
from public.altr_consent_history
on conflict do nothing;

insert into public.altr_consent_events (user_id, consent_type, event_type, policy_version, granted, locale, ip_address, user_agent, reason, created_at)
select user_id, 'ai_memory', event_type, policy_version, ai_memory_accepted, locale, ip_address, user_agent, reason, created_at
from public.altr_consent_history
on conflict do nothing;
