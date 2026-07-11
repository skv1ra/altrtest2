-- Altr billing database schema for Supabase
-- Run this in Supabase SQL Editor before using LiqPay production callbacks.

create extension if not exists pgcrypto;

create table if not exists public.altr_profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.altr_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  plan text not null check (plan in ('free', 'personal', 'work')),
  status text not null check (status in ('inactive', 'active', 'past_due', 'cancelled')),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  auto_renew boolean not null default true,
  provider text not null default 'liqpay',
  order_id text unique,
  provider_subscription_id text,
  updated_at timestamptz not null default now()
);

create table if not exists public.altr_payments (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  email text,
  plan text not null check (plan in ('personal', 'work')),
  amount numeric(10,2) not null,
  currency text not null default 'USD',
  status text not null default 'pending',
  auto_renew boolean not null default true,
  provider text not null default 'liqpay',
  provider_subscription_id text,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.altr_invoices (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  email text,
  plan text not null check (plan in ('personal', 'work')),
  amount numeric(10,2) not null,
  currency text not null default 'USD',
  status text not null check (status in ('paid', 'pending', 'failed')),
  receipt_url text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists altr_subscriptions_email_idx on public.altr_subscriptions(email);
create index if not exists altr_payments_email_idx on public.altr_payments(email);
create index if not exists altr_invoices_email_idx on public.altr_invoices(email);

alter table public.altr_profiles enable row level security;
alter table public.altr_subscriptions enable row level security;
alter table public.altr_payments enable row level security;
alter table public.altr_invoices enable row level security;

-- The app writes with SUPABASE_SERVICE_ROLE_KEY from server routes.
-- Do not expose the service role key to the browser.
