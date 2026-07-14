begin;

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

alter table public.altr_subscriptions
  add column if not exists provider_subscription_id text,
  add column if not exists provider_customer_id text,
  add column if not exists provider_order_id text,
  add column if not exists store_id text,
  add column if not exists product_id text,
  add column if not exists plan_id text,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists cancelled boolean not null default false,
  add column if not exists test_mode boolean not null default false,
  add column if not exists past_due_grace_ends_at timestamptz;

update public.altr_subscriptions
set provider_subscription_id = coalesce(provider_subscription_id, lemon_squeezy_subscription_id),
    provider_customer_id = coalesce(provider_customer_id, lemon_squeezy_customer_id),
    provider_order_id = coalesce(provider_order_id, lemon_squeezy_order_id),
    plan_id = coalesce(plan_id, plan)
where provider_subscription_id is null
   or provider_customer_id is null
   or provider_order_id is null
   or plan_id is null;

alter table public.altr_subscriptions
  alter column provider set default 'lemon_squeezy';

alter table public.altr_subscriptions drop constraint if exists altr_subscriptions_status_check;
alter table public.altr_subscriptions add constraint altr_subscriptions_status_check
  check (status in ('on_trial','active','paused','past_due','unpaid','cancelled','expired')) not valid;
alter table public.altr_subscriptions validate constraint altr_subscriptions_status_check;

alter table public.altr_subscriptions drop constraint if exists altr_subscriptions_provider_check;
alter table public.altr_subscriptions add constraint altr_subscriptions_provider_check
  check (provider = 'lemon_squeezy') not valid;
alter table public.altr_subscriptions validate constraint altr_subscriptions_provider_check;

create unique index if not exists altr_subscriptions_provider_subscription_uidx
  on public.altr_subscriptions(provider, provider_subscription_id)
  where provider_subscription_id is not null;

create table if not exists public.altr_billing_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  subscription_id uuid references public.altr_subscriptions(id) on delete set null,
  provider text not null default 'lemon_squeezy' check (provider = 'lemon_squeezy'),
  provider_order_id text not null,
  provider_customer_id text,
  store_id text,
  product_id text,
  variant_id text,
  plan_id text not null,
  status text not null,
  subtotal integer not null default 0,
  discount_total integer not null default 0,
  tax_total integer not null default 0,
  total integer not null default 0,
  currency text not null default 'USD',
  test_mode boolean not null default false,
  ordered_at timestamptz,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_order_id)
);

create table if not exists public.altr_billing_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  subscription_id uuid references public.altr_subscriptions(id) on delete set null,
  order_id uuid references public.altr_billing_orders(id) on delete set null,
  provider text not null default 'lemon_squeezy' check (provider = 'lemon_squeezy'),
  provider_invoice_id text,
  provider_order_id text,
  status text not null,
  amount_due integer not null default 0,
  amount_paid integer not null default 0,
  currency text not null default 'USD',
  invoice_url text,
  receipt_url text,
  issued_at timestamptz,
  paid_at timestamptz,
  test_mode boolean not null default false,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.altr_billing_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'lemon_squeezy' check (provider = 'lemon_squeezy'),
  provider_event_id text,
  event_name text not null,
  payload_hash text not null,
  signature_valid boolean not null,
  processing_status text not null default 'received' check (processing_status in ('received','processing','processed','ignored','failed')),
  attempts integer not null default 0,
  last_error text,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, payload_hash)
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

insert into public.altr_billing_invoices (
  id, user_id, subscription_id, provider, provider_order_id, status,
  amount_due, amount_paid, currency, receipt_url, paid_at, raw_payload, created_at, updated_at
)
select id, user_id, subscription_id, provider, lemon_squeezy_order_id, status,
       amount, case when status = 'paid' then amount else 0 end, currency,
       receipt_url, paid_at, raw_payload, created_at, created_at
from public.altr_invoices
on conflict (id) do nothing;

insert into public.altr_assistant_runs (
  id, user_id, run_type, input_text, output_text, model, status, created_at, updated_at
)
select id, user_id, 'draft_reply', source_text, draft_text, model,
       case when status = 'discarded' then 'cancelled' else 'completed' end,
       created_at, created_at
from public.altr_draft_replies
on conflict (id) do nothing;

create or replace function public.altr_set_subscription_grace_period()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'past_due' and (old.status is distinct from 'past_due' or new.past_due_grace_ends_at is null) then
    new.past_due_grace_ends_at = now() + interval '72 hours';
  elsif new.status <> 'past_due' then
    new.past_due_grace_ends_at = null;
  end if;
  new.cancelled = new.status = 'cancelled';
  return new;
end;
$$;

revoke all on function public.altr_set_subscription_grace_period() from public;

drop trigger if exists altr_subscriptions_grace_period on public.altr_subscriptions;
create trigger altr_subscriptions_grace_period
before insert or update of status, past_due_grace_ends_at on public.altr_subscriptions
for each row execute function public.altr_set_subscription_grace_period();

create index if not exists altr_profiles_user_id_idx on public.altr_profiles(user_id);
create index if not exists altr_user_preferences_user_id_idx on public.altr_user_preferences(user_id);
create index if not exists altr_data_connections_user_id_idx on public.altr_data_connections(user_id);
create index if not exists altr_consent_events_user_id_idx on public.altr_consent_events(user_id, occurred_at desc);
create index if not exists altr_subscriptions_user_id_idx on public.altr_subscriptions(user_id, updated_at desc);
create index if not exists altr_subscriptions_provider_customer_idx on public.altr_subscriptions(provider_customer_id);
create index if not exists altr_subscriptions_provider_order_idx on public.altr_subscriptions(provider_order_id);
create index if not exists altr_billing_orders_user_id_idx on public.altr_billing_orders(user_id, created_at desc);
create index if not exists altr_billing_orders_provider_customer_idx on public.altr_billing_orders(provider_customer_id);
create index if not exists altr_billing_invoices_user_id_idx on public.altr_billing_invoices(user_id, created_at desc);
create index if not exists altr_billing_invoices_provider_order_idx on public.altr_billing_invoices(provider_order_id);
create index if not exists altr_billing_webhook_payload_hash_idx on public.altr_billing_webhook_events(payload_hash);
create index if not exists altr_conversation_imports_user_id_idx on public.altr_conversation_imports(user_id, created_at desc);
create index if not exists altr_conversations_user_id_idx on public.altr_conversations(user_id, last_message_at desc);
create index if not exists altr_conversations_last_message_idx on public.altr_conversations(last_message_at desc);
create index if not exists altr_messages_user_id_idx on public.altr_messages(user_id, sent_at desc);
create index if not exists altr_messages_conversation_time_idx on public.altr_messages(conversation_id, sent_at);
create index if not exists altr_memories_user_id_idx on public.altr_memories(user_id);
create index if not exists altr_memories_category_idx on public.altr_memories(user_id, category);
create index if not exists altr_memories_active_idx on public.altr_memories(user_id, is_active);
create index if not exists altr_memories_embedding_hnsw_idx on public.altr_memories using hnsw (embedding vector_cosine_ops) where embedding is not null;
create index if not exists altr_memory_sources_user_id_idx on public.altr_memory_sources(user_id);
create index if not exists altr_assistant_configs_user_id_idx on public.altr_assistant_configs(user_id);
create index if not exists altr_assistant_runs_user_id_idx on public.altr_assistant_runs(user_id, created_at desc);
create index if not exists altr_draft_feedback_user_id_idx on public.altr_draft_feedback(user_id, created_at desc);
create index if not exists altr_deletion_requests_user_id_idx on public.altr_deletion_requests(user_id, requested_at desc);
create index if not exists altr_audit_events_user_id_idx on public.altr_audit_events(user_id, created_at desc);
create index if not exists altr_usage_counters_user_id_idx on public.altr_usage_counters(user_id, period_start desc);

alter table public.altr_profiles enable row level security;
alter table public.altr_user_preferences enable row level security;
alter table public.altr_data_connections enable row level security;
alter table public.altr_consent_events enable row level security;
alter table public.altr_subscriptions enable row level security;
alter table public.altr_billing_orders enable row level security;
alter table public.altr_billing_invoices enable row level security;
alter table public.altr_billing_webhook_events enable row level security;
alter table public.altr_conversation_imports enable row level security;
alter table public.altr_conversations enable row level security;
alter table public.altr_messages enable row level security;
alter table public.altr_memories enable row level security;
alter table public.altr_memory_sources enable row level security;
alter table public.altr_assistant_configs enable row level security;
alter table public.altr_assistant_runs enable row level security;
alter table public.altr_draft_feedback enable row level security;
alter table public.altr_deletion_requests enable row level security;
alter table public.altr_audit_events enable row level security;
alter table public.altr_usage_counters enable row level security;

revoke all on public.altr_billing_webhook_events from anon, authenticated;
revoke all on public.altr_subscriptions, public.altr_billing_orders, public.altr_billing_invoices from anon;
revoke insert, update, delete on public.altr_subscriptions, public.altr_billing_orders, public.altr_billing_invoices from authenticated;
grant select on public.altr_subscriptions, public.altr_billing_orders, public.altr_billing_invoices to authenticated;
revoke all on public.altr_consent_events, public.altr_audit_events, public.altr_usage_counters from anon;
revoke insert, update, delete on public.altr_consent_events, public.altr_audit_events, public.altr_usage_counters from authenticated;
grant select on public.altr_consent_events, public.altr_audit_events, public.altr_usage_counters to authenticated;
revoke all on public.altr_deletion_requests from anon;
grant select, insert on public.altr_deletion_requests to authenticated;
revoke update, delete on public.altr_deletion_requests from authenticated;

do $$
declare
  t text;
begin
  foreach t in array array[
    'altr_profiles','altr_user_preferences','altr_data_connections','altr_conversation_imports',
    'altr_conversations','altr_messages','altr_memories','altr_memory_sources',
    'altr_assistant_configs','altr_assistant_runs','altr_draft_feedback'
  ] loop
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'altr_profiles','altr_user_preferences','altr_data_connections','altr_conversation_imports',
    'altr_conversations','altr_messages','altr_memories','altr_memory_sources',
    'altr_assistant_configs','altr_assistant_runs','altr_draft_feedback'
  ] loop
    execute format('drop policy if exists %I on public.%I', t || '_owner_select', t);
    execute format('drop policy if exists %I on public.%I', t || '_owner_insert', t);
    execute format('drop policy if exists %I on public.%I', t || '_owner_update', t);
    execute format('drop policy if exists %I on public.%I', t || '_owner_delete', t);
    execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t || '_owner_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t || '_owner_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t || '_owner_update', t);
    execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t || '_owner_delete', t);
  end loop;
end;
$$;

drop policy if exists altr_subscriptions_owner_select on public.altr_subscriptions;
create policy altr_subscriptions_owner_select on public.altr_subscriptions
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists altr_billing_orders_owner_select on public.altr_billing_orders;
create policy altr_billing_orders_owner_select on public.altr_billing_orders
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists altr_billing_invoices_owner_select on public.altr_billing_invoices;
create policy altr_billing_invoices_owner_select on public.altr_billing_invoices
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists altr_consent_events_owner_select on public.altr_consent_events;
create policy altr_consent_events_owner_select on public.altr_consent_events
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists altr_deletion_requests_owner_select on public.altr_deletion_requests;
create policy altr_deletion_requests_owner_select on public.altr_deletion_requests
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists altr_deletion_requests_owner_insert on public.altr_deletion_requests;
create policy altr_deletion_requests_owner_insert on public.altr_deletion_requests
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists altr_audit_events_owner_select on public.altr_audit_events;
create policy altr_audit_events_owner_select on public.altr_audit_events
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists altr_usage_counters_owner_select on public.altr_usage_counters;
create policy altr_usage_counters_owner_select on public.altr_usage_counters
for select to authenticated using ((select auth.uid()) = user_id);

do $$
declare
  t text;
begin
  foreach t in array array[
    'altr_profiles','altr_user_preferences','altr_data_connections','altr_subscriptions',
    'altr_billing_orders','altr_billing_invoices','altr_conversation_imports','altr_conversations',
    'altr_messages','altr_memories','altr_assistant_configs','altr_assistant_runs',
    'altr_draft_feedback','altr_deletion_requests','altr_usage_counters'
  ] loop
    execute format('drop trigger if exists %I on public.%I', t || '_updated_at', t);
    execute format('create trigger %I before update on public.%I for each row execute function public.altr_set_updated_at()', t || '_updated_at', t);
  end loop;
end;
$$;

comment on column public.altr_subscriptions.past_due_grace_ends_at is
  'Premium access remains available for at most 72 hours after entering past_due. The database trigger sets and clears this boundary.';
comment on table public.altr_billing_webhook_events is
  'Service-role-only idempotency and audit storage for verified Lemon Squeezy webhook events. No client policy is intentionally defined.';

commit;
