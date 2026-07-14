# Legacy billing migration

Lemon Squeezy is the only billing provider used by the current application runtime. Historical LiqPay records may still exist in legacy tables or archived rows and must not be treated as proof of an active subscription.

## Runtime rule

- New subscriptions and invoices use `provider = 'lemon_squeezy'`.
- Premium access is granted only from a verified Lemon Squeezy webhook.
- Return, success, receipt, and status URLs are read-only and cannot activate or modify a plan.
- Client code cannot write subscription state.

## Safe migration path

1. Inventory historical tables and rows before making schema changes.
2. Preserve populated legacy tables under an explicit `altr_legacy_*` name or an unexposed archive schema.
3. Revoke `anon` and `authenticated` access to archived billing tables and keep RLS enabled where they remain exposed.
4. Do not copy historical paid status into active subscriptions automatically.
5. Migrate a customer only after matching the account to a verified Lemon Squeezy customer or subscription event.
6. After retention, legal, accounting, and reconciliation requirements are confirmed, prepare a separate reviewed deletion migration. Phase 1 does not drop historical tables or rows.

The ordered production migrations already default new billing records to `lemon_squeezy`. The older standalone `supabase/schema.sql` bootstrap is retired and must not be applied.
