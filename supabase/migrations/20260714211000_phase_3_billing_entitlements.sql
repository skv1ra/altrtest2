alter table public.altr_subscriptions drop constraint if exists altr_subscriptions_status_check;

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
where provider = 'lemon_squeezy';

update public.altr_subscriptions set status = 'expired' where status = 'inactive';

alter table public.altr_subscriptions
  add constraint altr_subscriptions_status_check
  check (status in ('on_trial','active','paused','past_due','unpaid','cancelled','expired'));

create or replace function public.altr_set_past_due_grace()
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
  new.cancelled = (new.status = 'cancelled');
  return new;
end;
$$;
revoke all on function public.altr_set_past_due_grace() from public;

drop trigger if exists altr_subscriptions_past_due_grace on public.altr_subscriptions;
create trigger altr_subscriptions_past_due_grace
before insert or update of status on public.altr_subscriptions
for each row execute function public.altr_set_past_due_grace();

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
  amount integer not null default 0 check (amount >= 0),
  currency text not null default 'USD',
  test_mode boolean not null default false,
  receipt_url text,
  raw_payload jsonb not null default '{}'::jsonb,
  ordered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, provider_order_id)
);

create table if not exists public.altr_billing_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  subscription_id uuid references public.altr_subscriptions(id) on delete set null,
  billing_order_id uuid references public.altr_billing_orders(id) on delete set null,
  provider text not null default 'lemon_squeezy' check (provider = 'lemon_squeezy'),
  provider_invoice_id text,
  provider_order_id text,
  status text not null,
  amount integer not null default 0 check (amount >= 0),
  currency text not null default 'USD',
  receipt_url text,
  issued_at timestamptz,
  paid_at timestamptz,
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
  payload jsonb not null,
  signature_valid boolean not null,
  processing_status text not null default 'received' check (processing_status in ('received','processed','ignored','failed')),
  processed_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  unique(provider, payload_hash)
);

create or replace function public.altr_user_entitlement(target_user_id uuid)
returns table(plan_id text, has_premium boolean, reason text, access_ends_at timestamptz)
language sql stable security invoker set search_path = public
as $$
  with latest as (
    select s.* from public.altr_subscriptions s
    where s.user_id = target_user_id and s.provider = 'lemon_squeezy'
    order by s.updated_at desc limit 1
  )
  select
    coalesce(latest.plan_id, latest.plan, 'free'),
    case
      when latest.status in ('on_trial','active') then true
      when latest.status = 'cancelled' and latest.ends_at > now() then true
      when latest.status = 'past_due' and latest.past_due_grace_ends_at > now() then true
      else false
    end,
    case
      when latest.id is null then 'no_subscription'
      when latest.status in ('on_trial','active') then latest.status
      when latest.status = 'cancelled' and latest.ends_at > now() then 'cancelled_until_end'
      when latest.status = 'past_due' and latest.past_due_grace_ends_at > now() then 'past_due_grace'
      else latest.status
    end,
    case
      when latest.status = 'cancelled' then latest.ends_at
      when latest.status = 'past_due' then latest.past_due_grace_ends_at
      when latest.status = 'on_trial' then latest.trial_ends_at
      else latest.renews_at
    end
  from (select 1) seed left join latest on true;
$$;
revoke all on function public.altr_user_entitlement(uuid) from public, anon;
grant execute on function public.altr_user_entitlement(uuid) to authenticated, service_role;
