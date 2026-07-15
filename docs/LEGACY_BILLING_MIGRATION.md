# Legacy billing migration

Lemon Squeezy is the only billing provider used by the current runtime. Historical LiqPay or prototype billing records may remain for reconciliation, but they are not proof of an active subscription and must never grant premium access.

## Current runtime rules

- New billing records use `provider = 'lemon_squeezy'`.
- Paid access comes only from a valid Lemon Squeezy subscription state written by a signature-verified webhook.
- Success, return, receipt and status pages are read-only.
- Browser/localStorage state cannot activate a plan.
- The authenticated user may read only their own billing summaries.

## Owner migration procedure

1. Inventory every historical billing table, row count, provider identifier and retention purpose.
2. Back up records before schema or data changes.
3. Keep legacy records under explicit archived names or an unexposed archive schema.
4. Revoke client access and keep restrictive RLS/policies on archived data.
5. Do not copy legacy `paid`, plan or expiry values into active Lemon Squeezy subscriptions.
6. Match a customer only through reviewed evidence and a verified Lemon Squeezy customer/subscription event.
7. Reconcile amounts, currency, refunds, chargebacks and accounting obligations separately from application entitlement.
8. Define anonymization/deletion timing with accounting, privacy and legal review.
9. Implement deletion or transformation as a separate reviewed migration with verification and rollback/forward-fix steps.
10. Test that archived rows cannot affect `altr_user_entitlement` or current billing APIs.

## Important boundaries

The ordered files in `supabase/migrations/` are authoritative. Retired `supabase/schema.sql` must not be used as a new production bootstrap. Test-mode Lemon Squeezy records must not be promoted into Live-mode entitlement records.

No automatic historical conversion is implemented. Any future migration requires explicit owner approval, database backup, legal/accounting review and dedicated tests.