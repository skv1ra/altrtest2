# Deployment

## Supported toolchain

- Node.js: 24.x
- Package manager: Yarn 1.22.22
- Lockfile: `yarn.lock` is required and committed

Local and CI installations must use:

```bash
yarn install --frozen-lockfile
```

Do not use `--ignore-engines` as a production workaround. Update the declared engine and dependencies deliberately instead.

## Vercel

The repository-owned `vercel.json` configures:

```text
Install command: yarn install --frozen-lockfile
Build command:   yarn build
```

Vercel project settings should either inherit these commands or match them exactly. The Node.js runtime is controlled by `package.json#engines.node`.

## Production deployment sequence

1. Merge only after CI passes.
2. Confirm all required Production environment variables from `docs/ENVIRONMENT.md` exist in Vercel.
3. Deploy `main` to Production.
4. Verify `GET /api/version` reports the expected commit SHA and `production` environment.
5. Smoke-test sign-in, profile loading, checkout creation, and webhook delivery.
6. Review Vercel runtime logs and Supabase logs for unexpected errors.

## Preview deployments

Preview environments may use a separate Supabase project or explicitly scoped non-production credentials. Add the preview callback URL to Supabase Auth URL configuration. Never point an untrusted fork preview at production service-role credentials.

## Rollback

Use Vercel's previous successful production deployment as the immediate rollback target. Database migrations require a separate reviewed rollback or forward-fix plan; rolling back application code does not reverse Supabase schema changes.

## CI credentials

CI uses obvious placeholder values and browser request interception. It must never receive Vercel Production secrets, Supabase service-role credentials, Lemon Squeezy keys, OpenAI keys, or Resend keys.
