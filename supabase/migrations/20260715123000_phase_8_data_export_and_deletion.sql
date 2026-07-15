alter table public.altr_deletion_requests
  alter column user_id drop not null,
  add column if not exists email text,
  add column if not exists email_verified boolean not null default false,
  add column if not exists requested_scope text not null default 'all',
  add column if not exists public_reference text,
  add column if not exists source text not null default 'authenticated',
  add column if not exists verification