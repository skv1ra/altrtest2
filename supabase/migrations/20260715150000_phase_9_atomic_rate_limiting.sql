create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.altr_rate_limit_buckets (
  action text not null,
  identifier_hash text not null,
  window_started_at timestamptz not null,
  window_seconds integer not null check (window_seconds between 1 and 86400),
  request_count integer not null default 1 check (request_count > 0),
  expires_at timestamptz not null,
  updated_at timestamptz not null default now(),
  primary key (action, identifier_hash, window_started_at)
);

create index if not exists altr_rate_limit_buckets_expires_idx
  on private.altr_rate_limit_buckets (expires_at);

create or replace function public.altr_consume_rate_limit(
  p_action text,
  p_identifier_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = pg_catalog, private
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_window_start timestamptz;
  v_count integer;
begin
  if p_action is null or length(p_action) < 1 or length(p_action) > 80 then
    raise exception 'invalid rate limit action';
  end if;
  if p_identifier_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid rate limit identity';
  end if;
  if p_limit < 1 or p_limit > 10000 or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'invalid rate limit configuration';
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds
  );

  insert into private.altr_rate_limit_buckets (
    action,
    identifier_hash,
    window_started_at,
    window_seconds,
    request_count,
    expires_at,
    updated_at
  )
  values (
    p_action,
    p_identifier_hash,
    v_window_start,
    p_window_seconds,
    1,
    v_window_start + make_interval(secs => p_window_seconds),
    v_now
  )
  on conflict (action, identifier_hash, window_started_at)
  do update set
    request_count = private.altr_rate_limit_buckets.request_count + 1,
    updated_at = excluded.updated_at
  returning request_count into v_count;

  delete from private.altr_rate_limit_buckets
  where expires_at < v_now - interval '1 day'
    and random() < 0.01;

  return query select
    v_count <= p_limit,
    greatest(p_limit - v_count, 0),
    v_window_start + make_interval(secs => p_window_seconds);
end;
$$;

revoke all on function public.altr_consume_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.altr_consume_rate_limit(text, text, integer, integer)
  to service_role;
