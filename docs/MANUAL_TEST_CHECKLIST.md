# Altr manual test checklist

Use Lemon Squeezy **test mode**, a dedicated Supabase test user, and a non-production deployment unless the final section explicitly says production. Record the date, tester, deployment SHA, request/event IDs, screenshots, and observed database state for every run.

## Supabase email confirmation
- Register with a new address and verify the UI does not create an authenticated application session prematurely.
- Open the confirmation email once; verify the callback creates/refreshes the session and routes through legacy review to the dashboard.
- Reopen the link; verify the expired/used-token state is handled without creating a second profile.

## Lemon Squeezy test checkout
- Start Personal and Work checkout from authenticated pricing.
- Verify the browser request contains only `planId`; verify server-selected store and variant IDs in provider logs.
- Complete test payment and confirm the success URL initially shows pending until the webhook is processed.

## Valid webhook
- Send a provider-generated event with the exact raw-body HMAC.
- Expect HTTP 200, one webhook-event record, the correct user/variant/plan, and an audit event.

## Invalid signature
- Reuse the payload with a changed or missing `X-Signature`.
- Expect HTTP 401 and no subscription, order, invoice, or trusted webhook-event write.

## Webhook replay
- Deliver the identical valid raw payload twice.
- Expect the second response to report duplicate/idempotent handling and no duplicate billing records.

## Cancellation
- Cancel an active test subscription in Lemon Squeezy.
- Verify `cancelled`, `ends_at`, portal access, and premium access only until the paid period ends.

## Renewal
- Trigger a successful renewal.
- Verify invoice/order history, new renewal date, active entitlement, and no duplicate subscription row.

## Payment failure
- Trigger `subscription_payment_failed`.
- Verify `past_due`, failed invoice, configured grace window, and expiry of access after grace.

## Payment recovery
- Trigger `subscription_payment_recovered`.
- Verify status returns to active, grace state is cleared, and access is restored from the webhook only.

## Customer Portal
- Open Billing and request a fresh portal URL.
- Verify it belongs to the authenticated user's provider subscription/customer and is never reused across users.

## Delayed webhook
- Complete checkout while delaying webhook delivery.
- Verify success page remains pending and cannot activate premium; deliver the webhook and verify polling then reflects server state.

## Refund
- Trigger an order refund.
- Verify refunded order/invoice state, audit history, and entitlement behavior matches the approved refund/cancellation policy.

## Production deployment
- Run `yarn format:check`, `yarn lint`, `yarn typecheck`, `yarn test`, `yarn build`, and `yarn test:e2e` against the release SHA.
- Run `yarn verify:production`; confirm `ALTR_E2E_MOCKS` and all unsafe flags are absent.
- Verify real Supabase, Lemon Squeezy, OpenAI, legal/support contacts, webhook URL/secret, variants, and app URL.
- Smoke-test registration, login, protected redirect, pricing, dashboard, memory, import, draft, billing portal, export/deletion, and sign out.
- Inspect Vercel build/runtime logs and verify there are no new error clusters before promotion.
