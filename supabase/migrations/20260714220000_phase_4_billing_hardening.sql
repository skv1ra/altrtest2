alter table public.altr_auth_rate_limits drop constraint if exists altr_auth_rate_limits_action_check;
alter table public.altr_auth_rate_limits
  add constraint altr_auth_rate_limits_action_check
  check (action in ('register','login','forgot','reset','billing_checkout'));

alter table public.altr_billing_webhook_events drop constraint if exists altr_billing_webhook_events_processing_status_check;
alter table public.altr_billing_webhook_events
  add column if not exists object_type text,
  add column if not exists object_id text,
  add column if not exists orphaned boolean not null default false,
  add column if not exists attempt_count integer not null default 0 check (attempt_count >= 0),
  add column if not exists last_attempt_at timestamptz,
  add constraint altr_billing_webhook_events_processing_status_check
  check (processing_status in ('received','processing','processed','ignored','orphaned','quarantined','failed'));

create index if not exists altr_billing_webhook_object_idx
  on public.altr_billing_webhook_events(object_type, object_id);

create unique index if not exists altr_billing_invoices_provider_invoice_unique
  on public.altr_billing_invoices(provider, provider_invoice_id)
  where provider_invoice_id is not null;

create unique index if not exists altr_billing_invoices_order_status_unique
  on public.altr_billing_invoices(provider, provider_order_id, status)
  where provider_order_id is not null;

create index if not exists altr_subscriptions_customer_lookup_idx
  on public.altr_subscriptions(provider, provider_customer_id)
  where provider_customer_id is not null;

create index if not exists altr_subscriptions_order_lookup_idx
  on public.altr_subscriptions(provider, provider_order_id)
  where provider_order_id is not null;
