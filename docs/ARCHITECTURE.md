# Architecture

## Runtime shape

Altr is a single Next.js 14 application using the App Router. It deploys to Vercel as static pages plus on-demand server routes.

```text
Browser
  -> Next.js pages and client components
  -> Next.js route handlers
       -> Supabase Auth and Postgres
       -> Lemon Squeezy
       -> OpenAI (draft generation only)
       -> Resend (optional transactional email)
```

## Main boundaries

### Presentation

- `app/` contains pages and route handlers.
- `components/` contains reusable UI grouped by domain where useful.
- Client components may request data from application APIs, but must not hold authoritative authentication, subscription, or payment state.

### Application and domain helpers

- `lib/auth.ts` defines client API wrappers and plan-access types.
- `lib/profileServer.ts` assembles authenticated profile state.
- `lib/lemonSqueezy.ts` owns checkout and webhook-signature helpers.
- `lib/conversationImports.ts`, `lib/memoryData.ts`, and assistant modules contain domain-specific parsing or presentation data.
- `lib/env.ts` validates runtime configuration at the server boundary.

### Data and identity

- Supabase Auth is the identity source of truth.
- Production tables and RLS policies are defined by ordered files in `supabase/migrations/`.
- Server-only work uses the service-role client; the service-role key must never reach browser bundles.
- User-owned reads and writes must always be scoped by the authenticated Supabase user UUID.

### Billing

- The browser asks `POST /api/billing/checkout` to create a Lemon Squeezy checkout.
- The authenticated user UUID is carried in provider custom data.
- Paid access is activated only by a signature-verified Lemon Squeezy webhook.
- Return and success pages are informational and never grant access.

### AI drafts

- AI generation is server-only and requires `OPENAI_API_KEY`.
- Imported conversation content is untrusted input.
- The current product generates drafts; it does not send messages automatically.

## Quality gates

- Vitest covers units, components, integrations, and source-level security regressions.
- React Testing Library is used for behavior-focused component tests.
- Playwright covers public rendering, version metadata, authenticated routing, and a mocked checkout flow.
- `yarn check` runs lint, typecheck, unit/integration tests, and a production build.
- GitHub Actions runs the frozen install, `yarn check`, and Playwright without production credentials.

## Deployment metadata

`GET /api/version` exposes only non-sensitive metadata: package version, Vercel Git SHA, build time, and environment name.
