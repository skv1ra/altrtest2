# Environment configuration

Copy `.env.example` to `.env.local` for local development. Values in this table are configuration names, never example production secrets.

| Variable                           | Scope         | Required        | Purpose                                                                                                     |
| ---------------------------------- | ------------- | --------------- | ----------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`              | Public        | Recommended     | Canonical application URL and OAuth callback base.                                                          |
| `NEXT_PUBLIC_SUPABASE_URL`         | Public        | Yes             | Supabase project URL used by SSR/client-compatible auth helpers.                                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`    | Public        | Yes             | Supabase publishable/anon key. RLS remains the authorization boundary.                                      |
| `SUPABASE_SERVICE_ROLE_KEY`        | Server only   | Yes             | Privileged server access for trusted route handlers.                                                        |
| `LEMONSQUEEZY_API_KEY`             | Server only   | Yes for billing | Creates checkout sessions.                                                                                  |
| `LEMONSQUEEZY_STORE_ID`            | Server only   | Yes for billing | Lemon Squeezy store identifier.                                                                             |
| `LEMONSQUEEZY_WEBHOOK_SECRET`      | Server only   | Yes for billing | Verifies webhook signatures.                                                                                |
| `LEMONSQUEEZY_PERSONAL_VARIANT_ID` | Server only   | Yes for billing | Maps the Personal plan to its provider variant.                                                             |
| `LEMONSQUEEZY_WORK_VARIANT_ID`     | Server only   | Yes for billing | Maps the Work plan to its provider variant.                                                                 |
| `OPENAI_API_KEY`                   | Server only   | Optional        | Enables real AI draft generation. Without it, the draft endpoint returns a controlled unavailable response. |
| `RESEND_API_KEY`                   | Server only   | Optional        | Application notifications such as support or privacy requests; never billing receipts.                     |
| `APP_BUILD_TIME`                   | Build/server  | Automatic       | Injected by `next.config.js`; may be overridden by build infrastructure.                                    |
| `VERCEL_GIT_COMMIT_SHA`            | Vercel system | Automatic       | Exposed through `/api/version` as deployment metadata.                                                      |
| `VERCEL_ENV`                       | Vercel system | Automatic       | `production`, `preview`, or `development` deployment name.                                                  |

## Environment scopes in Vercel

- Production variables apply only to production deployments.
- Preview variables should use non-production provider resources where possible.
- Development values are pulled locally only when explicitly needed.
- After changing any variable, redeploy; existing deployments keep the values captured at build/runtime creation.

## CI

`.github/workflows/ci.yml` defines non-secret placeholder values. Tests must mock provider boundaries and must not be changed to require real credentials.
