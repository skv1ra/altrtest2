# Security

## Completed in code

- Supabase Auth is the identity source of truth; protected routes and APIs require an authenticated session.
- User-owned queries are scoped by authenticated UUID and RLS remains the database boundary.
- Service-role, Lemon Squeezy, OpenAI and email-provider credentials are server-only.
- Checkout accepts only an allowlisted plan ID.
- Lemon Squeezy signatures are verified before parsing or mutation; store IDs and variants are validated; replays are idempotent; unknown variants are quarantined.
- Success URLs and local storage cannot activate subscriptions.
- Imported content is treated as untrusted data and AI output remains draft-only.
- Rate limits, quotas, structured redacted logging, CSP/security headers, export/deletion controls and automated regression tests are present.
- E2E mock authentication is disabled on Vercel and rejected by production verification.

## Account-owner responsibilities

- Protect provider accounts with MFA and least privilege.
- Store secrets only in approved environment/secret systems and rotate exposed values immediately.
- Keep Test/Preview and Production resources separate.
- Review Supabase RLS/advisors, Vercel access, webhook delivery, OpenAI usage and provider audit logs.
- Define backups, incident response, retention and access-review procedures.
- Do not connect untrusted fork previews to Production service-role credentials.

## Legal/security review required

Qualified review is still required for launch regions, privacy roles, retention, transfer mechanisms, subprocessors, breach response, refund handling and minimum age. Repository controls do not replace organizational policy or legal advice.

## Future integrations

Gmail, Calendar, messaging APIs, Operator, Negotiator and team workspaces will require new OAuth scopes, token storage, permission boundaries, audit events and threat modeling. They are not covered as completed functionality.

## Reporting

Do not post vulnerabilities, credentials or user data in public issues. Revoke affected credentials, preserve relevant audit evidence and coordinate a private fix and disclosure process.