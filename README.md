# Altr landing page and browser prototype

Premium near-future AI website for Altr with registration, dashboard, subscription selection, consent controls, legal pages, cookie preferences, data export, and local prototype deletion.

## Legal and privacy routes

- `/privacy` — bilingual Privacy Policy
- `/terms` — bilingual Terms of Use
- `/cookies` — bilingual Cookie Policy and audited browser-storage table
- `/data-deletion` — deletion process information
- `/delete-data` — authenticated local deletion and external local request form

Registration includes separate, unchecked controls for:

- acceptance of Terms and acknowledgement of Privacy Policy — required for account creation;
- conversation-processing consent — optional;
- personal AI-memory consent — optional.

The dashboard includes a **Privacy & Data** section for viewing and withdrawing consent, deleting local conversation/AI-memory demo state, exporting browser data, changing cookie preferences, and opening the full deletion flow.

## Prototype storage

This build has no production backend. Accounts, password hashes, sessions, plans, consent events, cookie preferences, and deletion request references are stored in first-party `localStorage` in the current browser. This makes the demo flow work without external credentials, but it is not an appropriate production architecture for authentication, consent evidence, or privacy-rights processing.

Read `LEGAL_SETUP.md` and fill `lib/legal/legal-config.ts` before production. The legal documents are drafts and require qualified legal review.

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm run lint
npm run build
```

## Deploy

Push the project root to GitHub and import it into Vercel. The root must contain `app`, `components`, `lib`, `package.json`, `next.config.js`, and Tailwind configuration files.
