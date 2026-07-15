# Altr

Altr is a Next.js 14 SaaS foundation for a personal AI system. Authenticated users can import approved conversation exports, review server-backed memory, configure an Altr Twin, generate draft replies, and manage Lemon Squeezy subscriptions. Supabase is the identity and data source of truth. OpenAI is called only from server routes. Raw import files are parsed locally and are not uploaded.

## Current status

**Completed in code**

- Supabase email/password authentication, cookie sessions, protected routes, ownership checks, ordered migrations and RLS.
- Server-authoritative profiles, memory, imports, assistants, billing and entitlements.
- Lemon Squeezy hosted checkout, verified/idempotent webhooks, invoices and Customer Portal.
- OpenAI Responses API draft generation and pgvector memory retrieval.
- Local Web Worker parsers, archive limits, data export, account deletion, security controls and automated tests.

**Account-owner action required**

- Configure Supabase, Lemon Squeezy, OpenAI and Vercel accounts and secrets.
- Apply/verify migrations, auth URLs, email confirmation, test billing and production billing.
- Complete every manual launch and production smoke test.

**Legal review required**

- Resolve every owner placeholder in `lib/legal/legal-config.ts`.
- Obtain qualified review of policies, launch regions, retention, refunds, renewals, liability and transfer mechanisms.

**Optional future integrations**

Gmail sync, improved Telegram/WhatsApp/Meta imports, Google Calendar, Operator, Negotiator and team workspaces are roadmap items. They are not complete.

## Local setup

Requirements: Node.js 24.x and Yarn 1.22.22.

```bash
cp .env.example .env.local
yarn install --frozen-lockfile
yarn dev
```

Configure the services first:

1. [Environment variables](docs/ENVIRONMENT.md)
2. [Supabase](docs/SUPABASE_SETUP.md)
3. [Lemon Squeezy](docs/LEMONSQUEEZY_SETUP.md)
4. [OpenAI](docs/OPENAI_SETUP.md)
5. [Deployment](docs/DEPLOYMENT.md)

## Quality gates

```bash
yarn lint
yarn typecheck
yarn test
yarn build
yarn test:e2e
yarn verify:production
```

`yarn verify:production` is intentionally stricter than local development. It rejects missing production configuration, unresolved legal placeholders and unsafe flags such as `ALTR_E2E_MOCKS`.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Security](docs/SECURITY.md)
- [Legal launch checklist](docs/LEGAL_LAUNCH_CHECKLIST.md)
- [Manual testing](docs/MANUAL_TESTING.md)
- [Roadmap](docs/ROADMAP.md)
- [Legacy billing migration](docs/LEGACY_BILLING_MIGRATION.md)

Non-sensitive deployment metadata is available from `GET /api/version`.