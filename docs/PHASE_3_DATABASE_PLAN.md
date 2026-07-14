# Phase 3 database plan

This branch replaces the prototype database bootstrap with ordered Supabase migrations, normalized ownership, Row Level Security, server-only billing writes, and entitlement helpers.

Implementation is being verified against the current Phase 2 runtime and the live Supabase schema. Legacy populated tables will not be dropped automatically.
