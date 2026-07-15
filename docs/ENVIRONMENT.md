# Environment configuration

Copy `.env.example` to `.env.local`. Never commit real values. Variables prefixed with `NEXT_PUBLIC_` may reach the browser; all other provider credentials are server-only.

## Required groups

**Application**
- `NEXT_PUBLIC_APP_URL`: local URL in development; canonical HTTPS URL in Production.

**Supabase**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Lemon Squeezy**
- `LEMONSQUEEZY_API_KEY`
- `LEMONSQUEEZY_STORE_ID`
- `LEMONSQUEEZY_WEBHOOK_SECRET`
- `LEMONSQUEEZY_PERSONAL_VARIANT_ID`
- `LEMONSQUEEZY_WORK_VARIANT_ID`

Store and variant IDs must be positive numeric values. Personal and Work IDs must differ. Test-mode values belong only in local/Preview; Live-mode values belong only in Production.

**OpenAI**
- `OPENAI_API_KEY`
- `OPENAI_RESPONSE_MODEL`
- `OPENAI_EMBEDDING_MODEL`

Production currently requires `text-embedding-3-small`; changing it needs a documented vector migration.

**Contacts and optional email**
- `PRIVACY_EMAIL` or `SUPPORT_EMAIL`
- optional `RESEND_API_KEY`
- `DELETION_REQUEST_EMAIL_FROM` when Resend is enabled

**Optional public links**
- `NEXT_PUBLIC_X_URL`
- `NEXT_PUBLIC_GITHUB_URL`

## Vercel scopes

Use separate Development, Preview and Production values. Redeploy after any change. Never place service-role, billing, webhook, OpenAI or email-provider credentials in browser variables.

CI uses obvious non-production placeholders and mocks external calls. It must not receive Production credentials.

## Release verification

```bash
yarn verify:ai-env
yarn verify:production
```

Production verification rejects missing required values, placeholders, invalid URLs/variant IDs, unresolved legal owner input and unsafe development flags.