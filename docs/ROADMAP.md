# Engineering roadmap

## Phase 0 — repository foundation

- standardize on Yarn 1.22.22 and commit `yarn.lock`;
- enforce frozen installs in Vercel and CI;
- declare Node.js 24.x support;
- establish lint, typecheck, Vitest, React Testing Library, Playwright, and Prettier commands;
- add credential-free CI and Dependabot;
- document architecture, deployment, environment, security, and the pre-fix baseline;
- expose non-sensitive deployment metadata at `/api/version`.

## Phase 1 — application correctness

- remove or isolate obsolete LiqPay and browser-prototype helpers still present outside active routes;
- consolidate billing status and receipt reads onto the current authenticated Supabase schema;
- improve loading and error state machines for authentication and pricing;
- add route-handler integration tests with mocked Supabase and provider clients;
- make profile, consent, and subscription write failures observable and actionable.

## Phase 2 — production hardening

- keep Next.js and related dependencies on supported patched releases through dedicated reviewed changes;
- add structured logging and error monitoring with personal-data redaction;
- add rate limiting and abuse controls to auth, imports, AI drafts, billing, and email routes;
- test webhook replay/idempotency and subscription lifecycle transitions;
- add database migration verification and Supabase type generation to CI.

## Phase 3 — product capabilities

- expand transparent memory controls and import processing;
- introduce durable job orchestration for long-running imports;
- add customer subscription management and cancellation flows;
- define explicit approval boundaries before any message-sending capability.
