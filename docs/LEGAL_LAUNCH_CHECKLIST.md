# Legal launch checklist

Phase 10 aligns the product copy with the current architecture, but it does not replace review by the product owner and qualified legal counsel.

## Owner-required values

Complete every `[NEEDS OWNER INPUT: ...]` value in `lib/legal/legal-config.ts` before production launch:

- legal entity or individual controller name;
- country and registered address;
- registration number, if applicable;
- privacy and support contacts;
- DPO or privacy contact, if applicable;
- governing law and dispute forum;
- refund, renewal, promotional pricing and liability terms;
- minimum age;
- international transfer mechanism;
- active-data and backup retention periods;
- supported launch jurisdictions.

Do not guess these values from the repository, deployment region or user location.

## Confirmed technical architecture

- Hosting and serverless execution: Vercel.
- Authentication and database: Supabase Auth and Supabase Postgres.
- Payments: Lemon Squeezy hosted checkout/customer portal. Lemon Squeezy acts as Merchant of Record for provider-processed purchases.
- AI: OpenAI Responses API and embeddings, using the configured production models.
- Email: Resend only when `RESEND_API_KEY` and sender/contact configuration are present.
- Imports: raw files are parsed locally in a browser Web Worker. Raw source files are not uploaded. User-approved normalized conversations/messages and derived memories are stored server-side in Supabase.
- Export: authenticated JSON or CSV ZIP export generated from server-side records.
- Deletion: public deletion request workflow plus fresh-authenticated full account deletion; user records/storage are deleted, and only minimal anonymized records permitted for reviewed billing, fraud, security, privacy-audit or compliance purposes may remain.
- Cookies/storage: necessary Supabase session cookies; `altr_cookie_preferences_v1`; optional `altr_language_v1`; no analytics or marketing storage enabled by default.

## Provider review

- Confirm current Vercel, Supabase, Lemon Squeezy, OpenAI and optional Resend contractual/privacy terms.
- Confirm the actual processing regions and approved international-transfer mechanism.
- Confirm Lemon Squeezy checkout wording, Merchant of Record disclosure, cancellation flow and refund handling.
- Confirm whether OpenAI provider settings meet the intended data-use and retention requirements.
- Confirm that Resend is mentioned only when it is actually configured and used.

## Product and consent review

- Verify registration presents separate acceptance of Terms/Privacy, conversation processing and AI-memory creation.
- Verify consent records include policy version, timestamp and available request metadata.
- Verify withdrawal stops future processing and does not falsely claim immediate deletion of existing data.
- Verify account export and deletion controls point to real server routes.
- Verify cookie banner never enables analytics or marketing and accurately describes functional language storage.
- Re-consent users when a material legal purpose or policy version changes.

## Release gate

Run with production environment variables:

```bash
yarn verify:production
```

The command must fail for unresolved legal placeholders, invalid/missing app URL, Supabase, Lemon Squeezy or OpenAI configuration, missing privacy/support contact, invalid variant IDs or unsafe development-only flags. It is intentionally separate from ordinary local `yarn dev` and `yarn build` so local development remains possible.

After it passes, run:

```bash
yarn lint
yarn typecheck
yarn test
yarn build
```

Finally, inspect the deployed legal pages, cookie banner, registration consent controls, hosted checkout disclosure, export download and deletion flows in a Vercel preview before promoting to production.