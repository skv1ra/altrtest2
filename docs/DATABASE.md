# Altr database

The application database is managed only through ordered files in `supabase/migrations/`. `supabase/schema.sql` is a retired compatibility notice and must not be copied into a project manually.

## Ownership and security

User-owned rows reference `auth.users(id)`. Password hashes remain exclusively in Supabase Auth and are never stored in application tables. RLS limits profiles, preferences, connections, conversations, messages, memories, assistant data, feedback, imports, deletion requests, subscriptions, orders, invoices, and usage counters to their owner.

Billing orders, invoices, subscriptions, webhook events, audit events, and quota mutations are trusted server concerns. Normal clients may only read their own subscription, order, invoice, and usage records. Webhook and audit tables have explicit deny policies for `anon` and `authenticated`; service-role code performs trusted writes.

Historical `altr_legacy_*` tables are intentionally retained. They are not a runtime source of truth and must only be removed through a deliberate reconciliation migration.

## Paid access

`altr_subscriptions` and `altr_user_entitlement(uuid)` are the source of truth. `profiles.plan` or browser state must never grant access.

| Status | Premium access |
| --- | --- |
| `on_trial` | Yes |
| `active` | Yes |
| `cancelled` | Until `ends_at` |
| `past_due` | For a fixed 72-hour grace period |
| `paused` | No |
| `unpaid` | No |
| `expired` | No |

The trigger `altr_set_past_due_grace()` records the grace deadline when a subscription enters `past_due`. Server code uses `getUserEntitlement()`, `requirePlan()`, and `hasPlanAccess()` before premium operations.

## Migration order

1. `20260714210000_phase_3_core_product_schema.sql`
2. `20260714211000_phase_3_billing_entitlements.sql`
3. `20260714212000_phase_3_rls_indexes_and_triggers.sql`
4. `20260714213000_phase_3_service_table_policies.sql`

RLS verification queries are documented in `supabase/tests/phase_3_rls_verification.sql`. Run write-denial checks only against a disposable Supabase branch or inside an explicitly rolled-back test transaction.
