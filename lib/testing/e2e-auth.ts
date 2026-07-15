import type { User } from "@supabase/supabase-js";

export const E2E_USER_HEADER = "x-altr-e2e-user";
export const E2E_EMAIL_HEADER = "x-altr-e2e-email";

export function e2eMocksEnabled() {
  return process.env.ALTR_E2E_MOCKS === "1" && process.env.VERCEL !== "1";
}

export function getE2EIdentity(headers: Headers) {
  if (!e2eMocksEnabled()) return null;
  const id = headers.get(E2E_USER_HEADER);
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return null;
  const email = headers.get(E2E_EMAIL_HEADER) || "playwright@example.com";
  return { id, email };
}

export function e2eUserFromHeaders(headers: Headers): User | null {
  const identity = getE2EIdentity(headers);
  if (!identity) return null;
  const now = new Date().toISOString();
  return {
    id: identity.id,
    email: identity.email,
    email_confirmed_at: now,
    confirmed_at: now,
    created_at: now,
    updated_at: now,
    aud: "authenticated",
    role: "authenticated",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: { full_name: "Playwright User" },
    identities: [],
  } as User;
}
