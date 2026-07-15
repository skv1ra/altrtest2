# Phase 0 baseline

This file records the repository state before Phase 0 fixes. The baseline was captured on 2026-07-13 from main commit `41c60aa0e58571b840afc0bdd31afc190f7cd1f4`, using Node.js 24 and Yarn 1.22.22 in GitHub Actions.

## Repository inventory

The application is a single Next.js 14 App Router project with:

- public marketing, legal, authentication, dashboard, memory, assistant, import, pricing, and billing-return pages;
- server routes for Supabase authentication, profile data, conversation imports, memories, AI drafts, Lemon Squeezy checkout/webhooks, receipts, and status;
- Supabase SQL migrations plus older prototype SQL and documentation;
- one Node test file containing seven source-level security regression tests;
- no committed dependency lockfile, ESLint configuration, browser test setup, or general CI workflow.

## Commands before fixes

| Command          | Result | Recorded failure or observation                                                                                                                      |
| ---------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn install`   | Passed | No lockfile existed, so Yarn resolved dependencies and generated one during the run.                                                                 |
| `yarn lint`      | Failed | `next lint` opened the interactive ESLint setup prompt because no ESLint configuration existed.                                                      |
| `yarn typecheck` | Passed | TypeScript completed successfully after dependencies were installed.                                                                                 |
| `yarn test`      | Passed | All 7 existing Node security regression tests passed.                                                                                                |
| `yarn build`     | Failed | Next.js attempted to prerender `/api/auth/google/start`; required Supabase public variables were absent in the credential-free baseline environment. |

## Existing Vercel behavior

The previous Vercel production deployment installed packages with:

```text
yarn install --ignore-engines --network-timeout 600000 --registry https://registry.npmjs.org/
```

The deployment had no committed lockfile and permanently bypassed engine checks. Its build passed only in the configured Vercel environment. Phase 0 replaces this with a frozen Yarn install and an explicit Node.js engine.

## Non-blocking observations

- The pinned Next.js 14.2.30 version emitted a security-update warning. Phase 0 applies the patch-line upgrade to 14.2.35 without changing application architecture.
- Several root-level setup documents described the retired LiqPay/browser-local prototype and were replaced with pointers to current documentation.
- `tsconfig.tsbuildinfo` was committed even though it is generated output.
