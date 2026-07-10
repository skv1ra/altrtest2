# Altr landing page

Premium near-future AI landing page for Altr.

## Account flow

The landing-page CTA and profile button open registration/sign-in. After sign-in, users are sent to a private dashboard with their Altr profile, learning data, connections, and settings. This prototype stores accounts and sessions in the current browser so the whole flow works without external credentials. Connect a hosted authentication provider and database before a production launch.

Every new account starts on the Free plan. Premium dashboard actions redirect to `/pricing`, where users can choose Free ($0), Personal ($20/month), or Work ($40/month). Plan changes are also stored in the current browser for this prototype.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Push the project root to GitHub and import it into Vercel. The root must contain `app`, `components`, `package.json`, `next.config.js`, and Tailwind config files.
