drop policy if exists "deny client audit events" on public.altr_audit_events;
create policy "deny client audit events"
on public.altr_audit_events
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "deny client billing webhook events" on public.altr_billing_webhook_events;
create policy "deny client billing webhook events"
on public.altr_billing_webhook_events
for all
to anon, authenticated
using (false)
with check (false);

revoke all on public.altr_usage_counters from anon, authenticated;
grant select on public.altr_usage_counters to authenticated;

drop policy if exists "usage counters own select" on public.altr_usage_counters;
create policy "usage counters own select"
on public.altr_usage_counters
for select
to authenticated
using ((select auth.uid()) = user_id);
