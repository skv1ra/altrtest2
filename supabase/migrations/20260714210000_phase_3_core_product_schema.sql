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
  status text not null default 'pending' check (status in ('pending','active','paused','error','revoked')),
  scopes text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  connected_at timestamptz,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider, external_account_id)
);

create table if not exists public.altr_consent_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('accepted','updated','withdrawn')),
  policy_version text not null,
  terms_accepted boolean not null,
  conversation_processing_accepted boolean not null,
  ai_memory_accepted boolean not null,
  locale text,
  ip_address inet,
  user_agent text,
  reason text,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.altr_conversation_imports
  add column if not exists connection_id uuid references public.altr_data_connections(id) on delete set null,
  add column if not exists imported_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.altr_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  import_id uuid references public.altr_conversation_imports(id) on delete set null,
  connection_id uuid references public.altr_data_connections(id) on delete set null,
  external_conversation_id text,
  platform text not null,
  title text,
  participant_names text[] not null default '{}',
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
  sender_name text,
  content text not null,
  sent_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.altr_memories
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists embedding extensions.vector(1536);

create table if not exists public.altr_memory_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  memory_id uuid not null references public.altr_memories(id) on delete cascade,
  conversation_id uuid references public.altr_conversations(id) on delete set null,
  message_id uuid references public.altr_messages(id) on delete set null,
  import_id uuid references public.altr_conversation_imports(id) on delete set null,
  source_type text not null check (source_type in ('message','conversation','import','manual','feedback')),
  source_excerpt text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.altr_assistant_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  assistant_type text not null default 'custom' check (assistant_type in ('digital_twin','custom')),
  instructions text not null default '',
  tone text not null default 'balanced' check (tone in ('balanced','warm','direct','formal')),
  is_default boolean not null default false,
  is_active boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.altr_assistant_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assistant_config_id uuid references public.altr_assistant_configs(id) on delete set null,
  conversation_id uuid references public.altr_conversations(id) on delete set null,
  run_type text not null default 'draft_reply' check (run_type in ('draft_reply','summary','classification','memory_extraction')),
  input_text text,
  output_text text,
  model text,
  status text not null default 'completed' check (status in ('queued','running','completed','failed','cancelled')),
  error_code text,
  usage_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.altr_draft_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assistant_run_id uuid not null references public.altr_assistant_runs(id) on delete cascade,
  rating smallint check (rating between 1 and 5),
  action text not null check (action in ('approved','edited','rejected','copied')),
  edited_text text,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.altr_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_type text not null default 'all_data' check (request_type in ('all_data','conversations','memories','account')),
  status text not null default 'requested' check (status in ('requested','verified','processing','completed','rejected','cancelled')),
  reason text,
  requested_at timestamptz not null default now(),
  verified_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.altr_audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  actor_type text not null default 'user' check (actor_type in ('user','service','system')),
  event_type text not null,
  entity_type text,
  entity_id text,
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
  quantity bigint not null default 0 check (quantity >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, metric, period_start, period_end)
);

insert into public.altr_consent_events (
  id, user_id, event_type, policy_version, terms_accepted,
  conversation_processing_accepted, ai_memory_accepted, locale,
  ip_address, user_agent, reason, occurred_at
)
select id, user_id, event_type, policy_version, terms_accepted,
       conversation_processing_accepted, ai_memory_accepted, locale,
       ip_address, user_agent, reason, created_at
from public.altr_consent_history
on conflict (id) do nothing;

insert into public.altr_audit_events (id, user_id, actor_type, event_type, metadata, created_at)
select id, user_id, case when user_id is null then 'system' else 'user' end, event_type, metadata, created_at
from public.altr_audit_logs
on conflict (id) do nothing;

insert into public.altr_assistant_runs (
  id, user_id, run_type, input_text, output_text, model, status, created_at, updated_at
)
select id, user_id, 'draft_reply', source_text, draft_text, model,
       case when status = 'discarded' then 'cancelled' else 'completed' end,
       created_at, created_at
from public.altr_draft_replies
on conflict (id) do nothing;
