# Billing setup

Altr uses Lemon Squeezy as the only active billing provider. Checkout creation is server-side, discounts are entered in Lemon Squeezy checkout, and paid access is granted only by verified Lemon Squeezy webhooks.

Customer receipts are sent and hosted by Lemon Squeezy. Altr does not expose a public payment-email endpoint.

See:

- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for webhook and release setup;
- [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) for required variables;
- [`docs/SECURITY.md`](docs/SECURITY.md) for the billing trust model;
- [`docs/LEGACY_BILLING_MIGRATION.md`](docs/LEGACY_BILLING_MIGRATION.md) for historical provider records.
