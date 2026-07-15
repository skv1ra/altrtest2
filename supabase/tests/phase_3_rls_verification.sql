-- Run against a disposable Supabase branch or wrap in a transaction.
-- Replace the UUIDs with two existing auth.users IDs.

begin;

-- Owner-scoped reads should only expose the JWT owner.
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
select count(*) as visible_profiles from public.altr_profiles;
select count(*) as visible_memories from public.altr_memories;
select count(*) as visible_conversations from public.altr_conversations;
select count(*) as visible_messages from public.altr_messages;
select count(*) as visible_subscriptions from public.altr_subscriptions;
select count(*) as visible_orders from public.altr_billing_orders;
select count(*) as visible_invoices from public.altr_billing_invoices;

-- These service-only tables must return no rows to a normal authenticated role.
select count(*) as visible_webhook_events from public.altr_billing_webhook_events;
select count(*) as visible_audit_events from public.altr_audit_events;

-- Direct billing writes must fail for authenticated clients.
-- savepoint billing_write_test;
-- insert into public.altr_billing_orders (user_id, provider_order_id, plan_id, status)
-- values ('00000000-0000-4000-8000-000000000001', 'rls-test', 'personal', 'paid');
-- rollback to billing_write_test;

-- Entitlement policy smoke checks use controlled test rows on a disposable branch:
-- on_trial/active => premium
-- cancelled => premium only while ends_at > now()
-- past_due => premium only while past_due_grace_ends_at > now()
-- paused/unpaid/expired => no premium
select * from public.altr_user_entitlement('00000000-0000-4000-8000-000000000001');

rollback;
