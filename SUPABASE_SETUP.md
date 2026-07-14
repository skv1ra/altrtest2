# Supabase setup

Supabase Auth and PostgreSQL are the production identity and data layer.

See:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for data ownership;
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for redirect and release configuration;
- [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) for required variables;
- [`docs/SECURITY.md`](docs/SECURITY.md) for RLS and service-role requirements.

Apply migrations from `supabase/migrations/` in order. Do not use the legacy `supabase/schema.sql` as the production migration source.
