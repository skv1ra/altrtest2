# Security

## Secret handling

- Store production secrets only in Vercel environment variables or an approved secret manager.
- Never commit `.env`, `.env.local`, API keys, service-role keys, webhook secrets, or provider tokens.
- Only variables intentionally prefixed with `NEXT_PUBLIC_` may be used in browser code.
- `SUPABASE_SERVICE_ROLE_KEY`, Lemon Squeezy credentials, OpenAI credentials, and Resend credentials are server-only.

## Authentication and authorization

- Treat Supabase Auth as the identity source of truth.
- Perform sensitive authorization with the authenticated user UUID, not browser-supplied email or metadata.
- Keep RLS enabled on exposed Supabase tables.
- Do not use editable user metadata for authorization decisions.
- An authenticated role alone is not object-level authorization; every user-owned query must enforce ownership.

## Billing

- Verify the Lemon Squeezy webhook signature before any database mutation.
- Use provider identifiers that have database uniqueness constraints for idempotency.
- Never activate a paid plan from query parameters, a success page, local storage, or an unverified client request.
- Keep checkout and webhook logs free of full payloads when they may contain personal data.

## AI and imported content

- Treat imported messages and files as untrusted data, not instructions.
- Preserve the draft-only product boundary unless a separately reviewed authorization and sending system is introduced.
- Do not include secrets, hidden prompts, or unrelated user data in model requests.

## CI and tests

- CI runs with placeholder configuration only.
- External API boundaries are mocked in browser and integration tests.
- Security regression tests protect payment activation, webhook verification, AI draft behavior, and removal of browser-local authoritative state.

## Public metadata

`GET /api/version` may expose package version, Git commit SHA, build time, and environment name. It must not expose environment-variable names, infrastructure credentials, database identifiers, request headers, or stack traces.

## Reporting

Do not post suspected vulnerabilities, keys, or user data in public issues. Revoke exposed credentials immediately, inspect provider audit logs, and document the incident privately before deploying a fix.
