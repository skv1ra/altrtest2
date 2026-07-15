# Altr

Altr is a Next.js 14 SaaS foundation for an authenticated personal AI system. Users can import approved conversation exports, review server-backed memory, configure an Altr Twin, generate draft replies, and manage Lemon Squeezy subscriptions. Supabase is the identity and data source of truth; OpenAI is used only from server routes; raw import files are parsed locally and are not uploaded.

## Delivery status

| Category | Status |
| --- | --- |
| **Code complete** | Supabase Auth/session protection, ordered migrations and RLS,