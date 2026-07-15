create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.altr_rate_limit_buckets (
  action text not null,
  identifier_hash text not null,
  window_started_at timestamptz not null,
  window_seconds integer not null check (window_seconds between 1 and 86400),
  request_count integer not null default 1 check (request_count > 