# Altr

Altr is a Next.js application for a personal AI system that learns from explicitly approved conversation imports, maintains transparent user-controlled memory, and creates draft replies. Supabase provides authentication and persistence; Lemon Squeezy provides subscription checkout and lifecycle events.

## Local setup

Requirements:

- Node.js 24.x
- Yarn 1.22.22

```bash
cp .env.example .env.local
yarn install --frozen-lockfile
yarn dev
```

## Quality commands

```bash
yarn lint
yarn typecheck
yarn test
yarn test:e2e
yarn format:check
yarn check
```

`yarn check` runs lint, TypeScript, unit/integration tests, and a production build. Playwright is run separately because it starts the built application and exercises critical browser flows.

## Deployment

Vercel is configured by `vercel.json` to run:

```text
yarn install --frozen-lockfile
yarn build
```

Do not use npm, pnpm, an uncommitted lockfile, or `--ignore-engines` for production installs.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Phase 0 baseline](docs/BASELINE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Environment variables](docs/ENVIRONMENT.md)
- [Security](docs/SECURITY.md)
- [Roadmap](docs/ROADMAP.md)

Non-sensitive deployment metadata is available from `GET /api/version`.
