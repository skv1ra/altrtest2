# Supabase setup

## Completed in code

Altr already contains Supabase SSR/browser/admin clients, email/password auth routes, callback handling, protected middleware, ordered SQL migrations, RLS policies, ownership checks and server-backed application state.

## Account-owner setup

1. Create or select a Supabase project.
2. Copy the project URL, publishable/anon key and service-role key into the matching local or Vercel environment scope.
3. In Authentication URL configuration, set the final Site URL.
4. Add local, Preview and Production callback URLs ending in `/auth/callback`.
5. Enable email/password sign-in and email confirmation.
6. Review confirmation, recovery and password-reset email templates.
7. Apply ordered migrations from `supabase/migrations/` in filename order. Do not apply retired `supabase/schema.sql` as a bootstrap.
8. Confirm RLS is enabled and that user-owned policies use the authenticated UUID.
9. Confirm the service-role key exists only on trusted server runtimes.
10. Create a test user and complete email confirmation, login, recovery and sign-out tests.
11. Verify profile, preferences, imports, memories, assistants and billing tables update only for that user.
12. Review Supabase Security Advisor findings before production.

## Google sign-in

The application has an OAuth callback foundation, but provider credentials and dashboard configuration require owner action. Enabling Google sign-in is separate from Gmail data sync. Gmail OAuth and incremental sync are future roadmap work and must not be presented as complete.

## Production checks

Verify exact Site URL/callback URLs, email delivery, RLS, migration history, backups, region, retention settings and project access controls. Use a separate test project or strictly separated credentials for CI/Preview where practical.