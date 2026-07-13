# Altr production foundation setup

This branch removes browser-local SaaS state as the source of truth and introduces a Supabase + Lemon Squeezy foundation.

## Required services

1. Supabase project
2. Supabase Google OAuth provider
3. Lemon Squeezy store
4. Lemon Squeezy subscription variants for `personal` and `work`
5. Optional OpenAI API key for draft generation

## Environment variables

Copy `.env.example` to `.env.local` and set real values. Never expose these to browser code:

- `SUPABASE_SERVICE_ROLE_KEY`
- `LEMONSQUEEZY_API_KEY`
- `LEMONSQUEEZY_WEBHOOK_SECRET`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`

Only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_APP_URL` are public.

## Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/202607130001_production_foundation.sql`.
3. Enable Google provider in Supabase Auth.
4. Add redirect URL: `${NEXT_PUBLIC_APP_URL}/auth/callback`.
5. Add site URL: `${NEXT_PUBLIC_APP_URL}`.

## Lemon Squeezy

1. Create two subscription variants:
   - Personal
   - Work
2. Set the variant IDs:
   - `LEMONSQUEEZY_PERSONAL_VARIANT_ID`
   - `LEMONSQUEEZY_WORK_VARIANT_ID`
3. Create a webhook endpoint:
   - `${NEXT_PUBLIC_APP_URL}/api/billing/webhook/lemon-squeezy`
4. Subscribe to at least:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_expired`
   - `order_created`
5. Copy the signing secret into `LEMONSQUEEZY_WEBHOOK_SECRET`.

## Security model

- Paid access is never activated from success URLs, query params, client localStorage, or email supplied by the browser.
- Checkout custom data contains the authenticated Supabase user UUID.
- Subscription state is written only after a verified Lemon Squeezy webhook.
- Imported conversation text is treated as untrusted data and cannot override system/developer instructions for AI generation.
- AI responses are draft-only; there is no automatic message sending.

## Local checks

Run:

```bash
yarn install
yarn check
```

This environment could not run dependency installation because the remote package registry/GitHub network was unavailable, so run checks locally before merge.
