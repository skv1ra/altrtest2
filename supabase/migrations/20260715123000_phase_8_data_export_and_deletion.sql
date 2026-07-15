alter table public.altr_deletion_requests alter column user_id drop not null;
alter table public.altr_deletion_requests
  add column if not exists email text,
  add column if not exists email_verified boolean not null default false,
  add column if not exists requested_scope text not null default 'all',
  add column if not exists public_reference text,
  add column if not exists source text not null default 'authenticated',
  add column if not exists verification_state text not null default 'pending',
  add column if not exists subject_hash text,
  add column if not exists processed_at timestamptz,
  add column if not exists anonymized_at timestamptz;

update public.altr_deletion_requests
set requested_scope = case when request_type = 'full_account' then 'all' else 'selected_data' end
where requested_scope is null or requested_scope = '';

alter table public.altr_deletion_requests
  drop constraint if exists altr_deletion_requests_requested_scope_check,
  add constraint altr_deletion_requests_requested_scope_check check (requested_scope in ('all','account','conversations','memory')),
  drop constraint if exists altr_deletion_requests_source_check,
  add constraint altr_deletion_requests_source_check check (source in ('authenticated','public')),
  drop constraint if exists altr_deletion_requests_verification_state_check,
  add constraint altr_deletion_requests_verification_state_check check (verification_state in ('pending','verified','not_required','failed'));

create unique index if not exists altr_deletion_requests_public_reference_key on public.altr_deletion_requests(public_reference) where public_reference is not null;
create index if not exists altr_deletion_requests_email_created_idx on public.altr_deletion_requests(lower(email), created_at desc) where email is not null;

create table if not exists public.altr_deletion_request_history (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.altr_deletion_requests(id) on delete cascade,
  actor_type text not null default 'system' check (actor_type in ('user','public','service','admin','system')),
  actor_user_id uuid references auth.users(id) on delete set null,
  from_status text,
  to_status text not null,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.altr_deletion_request_history enable row level security;
create index if not exists altr_deletion_request_history_request_idx on public.altr_deletion_request_history(request_id, created_at);
drop policy if exists "deletion request history own select" on public.altr_deletion_request_history;
create policy "deletion request history own select" on public.altr_deletion_request_history for select to authenticated
  using (exists (select 1 from public.altr_deletion_requests r where r.id = request_id and r.user_id = (select auth.uid())));

drop policy if exists "deletion requests own insert" on public.altr_deletion_requests;
drop policy if exists "deletion requests own select" on public.altr_deletion_requests;
create policy "deletion requests own select" on public.altr_deletion_requests for select to authenticated using (user_id = (select auth.uid()));

alter table public.altr_auth_rate_limits drop constraint if exists altr_auth_rate_limits_action_check;
alter table public.altr_auth_rate_limits add constraint altr_auth_rate_limits_action_check
  check (action in ('register','login','forgot','reset','billing_checkout','import_create','import_chunk','memory_write','assistant_write','privacy_request','data_export','account_delete'));

alter table public.altr_subscriptions add column if not exists deleted_subject_hash text, alter column user_id drop not null;
alter table public.altr_invoices add column if not exists deleted_subject_hash text, alter column user_id drop not null;
alter table public.altr_billing_orders add column if not exists deleted_subject_hash text, alter column user_id drop not null;
alter table public.altr_billing_invoices add column if not exists deleted_subject_hash text, alter column user_id drop not null;

comment on column public.altr_deletion_requests.email_verified is 'True only when derived from an authenticated verified identity or a completed verification process.';
comment on column public.altr_deletion_requests.subject_hash is 'Irreversible hash used to correlate retained compliance records without retaining the Auth user.';
comment on column public.altr_subscriptions.deleted_subject_hash is 'Irreversible subject hash retained after account deletion; no fixed retention period is asserted by this schema.';
comment on column public.altr_invoices.deleted_subject_hash is 'Irreversible subject hash retained after account deletion; no fixed retention period is asserted by this schema.';
comment on column public.altr_billing_orders.deleted_subject_hash is 'Irreversible subject hash retained after account deletion; no fixed retention period is asserted by this schema.';
comment on column public.altr_billing_invoices.deleted_subject_hash is 'Irreversible subject hash retained after account deletion; no fixed retention period is asserted by this schema.';