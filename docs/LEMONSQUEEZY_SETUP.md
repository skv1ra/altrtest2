# Lemon Squeezy setup

## Completed in code

Altr already provides authenticated hosted checkout, server-side variant mapping, raw-body HMAC verification, store validation, idempotent webhook processing, unknown-variant quarantine, subscription/order/invoice persistence, webhook-only entitlement changes and fresh Customer Portal URLs. The payment success page is informational and cannot upgrade a plan.

## Test-mode owner setup

1. Create a Lemon Squeezy account and create or activate a store.
2. Start in **Test mode**. Do not begin with live products.
3. Create two subscription products or variants: **Personal** and **Work**.
4. Configure their billing interval, price, currency and customer-facing copy.
5. Copy the numeric store ID and the numeric Personal and Work variant IDs.
6. Create a Test-mode API key with the access required by checkout, variant lookup, subscription lookup and Customer Portal.
7. Create a webhook and generate a dedicated signing secret.
8. Set the webhook endpoint to your HTTPS application URL plus:

```text
/api/webhooks/lemonsqueezy
```

9. Select these events:

```text
order_created
order_refunded
subscription_created
subscription_updated
subscription_cancelled
subscription_resumed
subscription_expired
subscription_paused
subscription_unpaused
subscription_payment_success
subscription_payment_failed
subscription_payment_recovered
```

10. Configure the matching Lemon Squeezy environment variables in local or Preview scope. Use only IDs from the same Test-mode store.
11. Register a Supabase test user and start Personal and Work checkouts from `/pricing`.
12. Complete a Test-mode checkout. The success page should remain pending until a verified webhook updates the database.
13. Simulate subscription creation, update, cancellation, pause, resume, payment failure, recovery, renewal and refund events.
14. Verify `altr_billing_webhook_events`, `altr_subscriptions`, `altr_billing_orders`, `altr_billing_invoices` and audit records. Confirm the user and plan are correct and replays do not create duplicates.
15. Open Billing and verify the Customer Portal URL belongs to the authenticated user's stored subscription.

## Live-mode owner setup

Create separate Live-mode Personal and Work products/variants, a separate Live API key, a separate webhook and a separate signing secret. Add only the Live store/variant IDs and Live credentials to the Production environment.

**Never reuse Test-mode store IDs, variant IDs, API keys or webhook secrets as Live-mode values.** Preview should use Test mode; Production should use Live mode.

## Security and troubleshooting

- Checkout accepts only `personal` or `work`; prices, variants, users and status are selected server-side.
- Invalid signatures are rejected before parsing or database writes.
- Events from another store are rejected.
- Unknown variants are quarantined and never grant access.
- A delayed webhook must leave the success page pending.
- If the portal fails, confirm the authenticated user has a stored Lemon Squeezy subscription ID and that the API key belongs to the same mode/store.

Use [Manual testing](MANUAL_TESTING.md) before launch.