# Authentication and server sessions

Altr uses Supabase Auth with `@supabase/ssr` cookie sessions. Browser localStorage is not an authentication or authorization source.

## Trust boundaries

- Middleware refreshes the Supabase session and rejects unauthenticated protected routes.
- Server helpers use `auth.getUser()` before protected data access.
- The service-role client is isolated in `lib/supabase/admin.ts` and imports `server-only`.
- Registration, login, forgot-password, and reset-password endpoints use Zod validation and database-backed rate limits.
- Login and forgot-password responses do not reveal whether an account exists.
- Profile creation is performed by a controlled server operation after Supabase creates the Auth user.
- Consent acceptance and withdrawal events are stored server-side with policy version and available request metadata.

## Protected application routes

`/dashboard`, `/memory`, `/assistants`, `/import-conversations`, `/billing`, `/payment/success`, `/legacy-migration`, and non-public application APIs require a verified server session.

## Required Supabase dashboard configuration

1. Set the production Site URL to the canonical Altr domain.
2. Add production and trusted preview callback URLs ending in `/auth/callback`.
3. Keep email confirmation enabled for password registration.
4. Configure the recovery and confirmation email templates to return users to the configured application callback.
5. Enable leaked-password protection.
6. Configure Google OAuth credentials if the Google button is enabled.

## Legacy prototype data

After the first verified login, users review old browser-local prototype records. They can export them as JSON, migrate only safe profile/settings fields, or delete them locally. Passwords and local billing state are never migrated.
