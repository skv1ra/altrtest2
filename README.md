# Altr landing page

Premium near-future AI landing page for Altr.

## Account flow

The landing-page CTA and profile button open registration/sign-in. After sign-in, users are sent to a private dashboard with their Altr profile, learning data, connections, and settings. This prototype stores accounts and sessions in the current browser so the whole flow works without external credentials. Connect a hosted authentication provider and database before a production launch.

Every new account starts on the Free plan. Premium dashboard actions redirect to `/pricing`, where users can choose Free ($0), Personal ($20/month), or Work ($40/month). Plan changes are also stored in the current browser for this prototype.

Legal pages are available at `/privacy`, `/terms`, `/cookies`, `/data-deletion`, and `/data-deletion/request`. Complete every item in `LEGAL_SETUP.md` before a public production launch.

Conversation imports are available at `/import-conversations`. The browser-local prototype parses manual JSON/TXT/HTML/CSV files, Telegram exports, Gmail/Google Takeout MBOX, WhatsApp TXT, Instagram/Messenger JSON, and supported files inside ZIP archives. Import history and preview snippets remain on the current device until deleted.

The AI Memory control center is available at `/memory` with category filters, search, edit/delete controls, pause/resume learning, clear-all confirmation, and data-source placeholders. Its MVP data uses local React state as requested.

Promo codes can be entered on `/pricing`. The test code `test1` grants the Work plan for 30 days once per local account.

The three-assistant frontend MVP is available at `/assistants`. It includes Altr Twin, Operator, Negotiator, local configuration controls, a capability matrix, behavior simulation, safety controls, and EN/UA interface copy.

Reliable accounts across refreshes, Vercel preview domains, browsers, and devices require server authentication and a database. The current localStorage account prototype is origin-specific and must not be treated as production authentication.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Push the project root to GitHub and import it into Vercel. The root must contain `app`, `components`, `package.json`, `next.config.js`, and Tailwind config files.
