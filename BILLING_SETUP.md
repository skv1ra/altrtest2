# Billing setup

Altr uses Lemon Squeezy as the only active billing provider through the official `@lemonsqueezy/lemonsqueezy.js` SDK. Checkout is hosted by Lemon Squeezy and created only by the authenticated server endpoint `POST /api/billing/checkout`.

The browser may send only `{ "planId": "personal" | "work" }`. The server maps that application plan to an allowlisted variant ID, prefills the authenticated Supabase user, enables Lemon Squeezy discount entry, and redirects to `/payment/success`. No local paid subscription is created during checkout.

## Webhook

Configure Lemon Squeezy to send events to:

`POST /api/webhooks/lemonsqueezy`

The route reads the raw body, verifies `X-Signature` with HMAC SHA-256, validates the store and payload, maps only configured variants, and stores an idempotency hash before changing billing state. Failed events return 5xx so Lemon Squeezy can retry. Missing trusted user relationships become orphaned and unknown variants are quarantined without granting access.

## Current-user billing

- `GET /api/billing/me` returns only the authenticated user's entitlement, subscription summary, and invoices.
- `POST /api/billing/portal` obtains a fresh Customer Portal URL from the trusted stored subscription ID.
- `/payment/success` waits for verified webhook state and never activates a plan from URL parameters.
- `/billing` is the customer billing page; `/pricing` starts hosted checkout.

Customer receipts are sent and hosted by Lemon Squeezy. Altr does not manufacture local receipts or expose a public payment-email endpoint.

## Environment separation

Use Lemon Squeezy **test-mode** API keys, store/variant IDs, and webhook secret for Vercel Preview. Use separate **live-mode** values for Vercel Production. Never reuse a preview webhook secret or test variant ID in production. `NEXT_PUBLIC_APP_URL` must also match the relevant environment so checkout returns to the correct deployment.

See:

- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for release setup;
- [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) for required variables;
- [`docs/SECURITY.md`](docs/SECURITY.md) for the billing trust model;
- [`docs/LEGACY_BILLING_MIGRATION.md`](docs/LEGACY_BILLING_MIGRATION.md) for historical provider records.
