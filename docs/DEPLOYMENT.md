# Deployment

## Completed in code

The repository pins Node.js 24.x and Yarn 1.22.22. `vercel.json` uses a frozen Yarn install and `yarn build`. CI runs lint, typecheck, unit/integration tests, production build and Playwright with mocked external services.

## Account-owner deployment steps

1. Connect the repository to Vercel.
2. Keep the framework as Next.js and use repository commands from `vercel.json`.
3. Configure Development, Preview and Production variables from `ENVIRONMENT.md`.
4. Use Test-mode Lemon Squeezy resources in Preview and separate Live-mode resources in Production.
5. Add every Vercel domain/callback to Supabase Auth URL configuration.
6. Apply and verify ordered Supabase migrations before code that depends on them reaches Production.
7. Run:

```bash
yarn lint
yarn typecheck
yarn test
yarn build
yarn test:e2e
yarn verify:production
```

8. Deploy the release SHA to Preview and complete `MANUAL_TESTING.md`.
9. Promote only the reviewed SHA to Production.
10. Verify `GET /api/version`, registration, login, dashboard, memory, import, AI draft, checkout, webhook and Customer Portal.
11. Review Vercel, Supabase, Lemon Squeezy and OpenAI logs for errors without exposing personal data.

## Rollback

Roll back application code to the previous successful Vercel deployment. A code rollback does not reverse database migrations or provider events. Use a separately reviewed forward-fix or rollback migration for schema changes.

## Release blockers

Do not launch with unresolved legal placeholders, missing owner configuration, Test-mode billing IDs in Production, unsafe E2E flags, failing CI, unverified webhooks or incomplete manual tests.