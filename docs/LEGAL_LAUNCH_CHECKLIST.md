# Legal launch checklist

This checklist is operational documentation, not legal advice.

## Implemented in code

Legal pages, consent records, cookie preferences, export, deletion and a production verification command exist. Analytics and marketing are disabled by default. Raw import files stay local; approved normalized data may be stored in Supabase.

## Owner action

Resolve every `[NEEDS OWNER INPUT: ...]` entry in `lib/legal/legal-config.ts`. Confirm the real business identity, contacts, supported regions, age rule, retention periods, renewal/refund terms, pricing terms, liability position, governing rules and data-transfer approach.

Confirm which providers are actually enabled in Production and who handles support, privacy requests, refunds and account deletion.

## Professional review

Have qualified counsel review the final Terms, Privacy Policy, Cookie Policy, consent wording, billing disclosures, cancellation/refund language, retention, international processing, minors, AI processing and launch regions.

Do not copy guesses from the repository or deployment location. A passing build is not legal approval.

## Launch gate

1. Complete owner values.
2. Record legal approval and policy version/date.
3. Run `yarn verify:production` and all automated checks.
4. Complete `docs/MANUAL_TESTING.md`.
5. Inspect deployed legal, consent, cookie, checkout, export and deletion flows.
6. Review material future changes before release.

Gmail, Calendar, messaging, Operator, Negotiator and team features are future work and need separate review.