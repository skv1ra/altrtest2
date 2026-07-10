# Altr legal setup before production

The legal and privacy UI in this project is a product draft, not legal approval. Complete every item below and have the final documents reviewed for the countries where Altr will be offered.

## Mandatory owner inputs

Edit `lib/legal/legal-config.ts` and replace every `[NEEDS OWNER INPUT: ...]` value:

- `LEGAL_ENTITY_NAME`
- `COMPANY_COUNTRY`
- `REGISTERED_ADDRESS`
- `COMPANY_REGISTRATION_NUMBER`, if applicable
- `PRIVACY_EMAIL`
- `SUPPORT_EMAIL`
- `DPO_CONTACT`, if applicable
- `GOVERNING_LAW`
- `DISPUTE_JURISDICTION`
- `REFUND_POLICY`
- `SUBSCRIPTION_RENEWAL_POLICY`
- `PROMOTIONAL_PRICING_POLICY`
- `LIABILITY_CAP`
- `MINIMUM_AGE`
- `AI_PROVIDER_NAME`
- `EMAIL_PROVIDER_NAME`
- `FILE_STORAGE_PROVIDER_NAME`
- `AI_TRAINING_ON_USER_DATA`
- `INTERNATIONAL_TRANSFER_MECHANISM`
- `DATA_RETENTION_PERIOD`
- `BACKUP_RETENTION_PERIOD`
- regional availability for the EEA, UK, Ukraine, USA, and California

Confirm and update the prefilled provider statements for hosting, database, authentication, payments, analytics, and error monitoring whenever the production stack changes.

## Current prototype limitations

- Accounts, password hashes, sessions, plan changes, consent records, cookie preferences, and privacy requests are stored in first-party `localStorage` in the current browser.
- The prototype has no production database, hosted authentication, verified-email workflow, payment processor, AI provider, file store, analytics provider, or server-side privacy request queue.
- The `/delete-data` authenticated flow removes keys beginning with `altr_` from the current browser only.
- The external privacy form creates a local request reference only; it does not transmit the request to Altr.
- The cookie banner does not initialize analytics or marketing because none is integrated.

## Production work still required

1. Replace browser-only authentication with secure server-side authentication and password handling.
2. Store consent events in an auditable server-side database with user, version, timestamp, locale, source, and withdrawal history.
3. Build verified deletion/export APIs with authentication, authorization, input validation, CSRF protection where relevant, rate limiting, and abuse protection.
4. Add email verification and status notifications for privacy requests.
5. Implement deletion jobs for the database, files, vectors, embeddings, knowledge graph, queues, backups, AI providers, email/calendar integrations, and other subprocessors.
6. Add production subscription cancellation and billing-record retention rules before taking payment.
7. Re-audit the Cookie Policy and consent gate before adding analytics, advertising, embedded content, or third-party authentication.
8. Create and maintain a production subprocessor list and international-transfer documentation.
9. Define source-level and derived-data deletion behavior, including summaries, embeddings, aggregate style patterns, and personal AI memory.
10. Complete a security and privacy review before importing real conversations.

## Legal review

A qualified lawyer should review the Privacy Policy, Terms of Use, Cookie Policy, consent wording, third-party-message processing, AI profiling, autonomous replies, regional rights, consumer subscription rules, limitation of liability, and deletion/retention process before commercial launch.
