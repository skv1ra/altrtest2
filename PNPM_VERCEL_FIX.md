# Vercel npm install fix

This project uses pnpm on Vercel to avoid npm install failures like:

`npm error Exit handler never called!`

Vercel should use:

- Install command: `pnpm install --no-frozen-lockfile --registry=https://registry.npmjs.org/`
- Build command: `pnpm run build`

If Vercel still runs npm, set these manually in:

Project Settings -> Build and Deployment -> Install Command / Build Command
