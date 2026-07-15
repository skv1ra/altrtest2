# Manual testing

Automated tests mock external providers. This checklist validates real account configuration. Use Test-mode providers and a dedicated test user unless the step explicitly says Production. Record tester, date, deployment SHA, provider event/request IDs and observed database state.

## Supabase

- Register a new user and verify form validation.
- Confirm the email once and verify the callback/session/dashboard flow.
- Verify login, password recovery, protected-route redirect and sign out.
- Confirm one user cannot read or mutate another user's profile, memory, imports or billing data.

## Lemon Squeezy Test mode

- Run Personal and Work checkouts. Confirm the browser submits only `planId`.
- Complete a test payment and verify the success page cannot activate access before a webhook.
- Deliver a valid webhook and verify the correct subscription, order/invoice and audit records.
- Send the same event again and verify idempotency.
- Send a missing/invalid signature and verify HTTP 401 with no trusted billing mutation.
- Test another store ID and an unknown variant; verify rejection/quarantine and no entitlement.
- Test cancellation, renewal, pause/unpause, payment failure, recovery, delayed delivery and refund.
- Open Customer Portal and verify it belongs to the authenticated user's subscription.

## Imports, memory and AI

- Import a small fixture for each supported format and inspect normalized conversations.
- Test malformed ZIP, excessive archive limits, duplicate import, cancellation and retry.
- Create, edit, disable and delete memory; verify provenance and ownership.
- Generate a draft with real OpenAI configuration and verify it is draft-only.
- Include prompt-injection text in imported content and verify it is treated as data.
- Verify plan quotas and controlled provider-unavailable behavior.

## Privacy and legal

- Verify policy/consent version, cookie preferences, export, deletion request and authenticated full deletion.
- Confirm analytics/marketing remain off unless separately implemented and reviewed.
- Confirm all legal owner placeholders are resolved and approved.

## Production smoke test

Run all automated commands and `yarn verify:production` against the release SHA. Verify Production uses Live Lemon Squeezy resources, the final Supabase project, production OpenAI configuration and correct HTTPS URLs. Smoke-test auth, dashboard, memory, import, draft, checkout, webhook, portal, export, deletion and sign out. Review provider/runtime logs before promotion.