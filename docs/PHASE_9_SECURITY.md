# Phase 9 — Security hardening

## Response security

`middleware.ts` generates a per-request nonce and request ID, forwards both to the App Router, and adds a Content Security Policy plus HSTS in production, `nosniff`, strict referrer handling, a restrictive Permissions Policy, and clickjacking protection.

Production CSP does not include `unsafe-eval`. Development adds it only for the Next.js development runtime. Lemon Squeezy is allowed only for hosted checkout/portal frames and form navigation. Supabase HTTPS and WebSocket endpoints are allowed for authenticated data access.

## Persistent rate limiting

Sensitive endpoints use the atomic `public.altr_consume_rate_limit` Postgres function. Buckets are stored in the private schema and updated with one `INSERT ... ON CONFLICT DO UPDATE` statement. Function execution is revoked from `PUBLIC`, `anon`, and `authenticated`, and granted only to `service_role`.

Covered actions include login, registration, password recovery/reset, checkout, billing portal, AI generation, imports, memory and assistant writes, privacy deletion requests, data exports, and account deletion.

## Logging and errors

Server logs are newline-delimited JSON. Sensitive key names, including credentials, cookies, tokens, message contents, conversations, memories, and raw provider payloads, are redacted. API failure responses use stable public codes and request IDs; stack traces and raw provider/database errors are not returned in production responses.

Security-sensitive operations continue to write audit events without storing raw conversation or memory contents.

## Sentry

Sentry is intentionally not installed in Phase 9. It remains optional and should only initialize when a DSN is configured. Any future integration must disable default collection of request bodies and scrub conversation and memory data before transport.

## Verification

The migration is tested against the live Supabase project, and Vercel preview builds run linting, type checking, tests, and the production Next.js build.
