import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";
import { e2eUserFromHeaders } from "@/lib/testing/e2e-auth";

export { createSupabaseAdminClient } from "@/lib/supabase/admin";

export function createSupabaseServerClient() {
  const env = getPublicEnv();
  const cookieStore = cookies();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(values) {
        try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
        catch { /* Server Components cannot write cookies. */ }
      },
    },
  });
}

export async function getOptionalUser(): Promise<User | null> {
  const mock = e2eUserFromHeaders(headers());
  if (mock) return mock;
  const { data, error } = await createSupabaseServerClient().auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getOptionalUser();
  if (!user) throw new Error("AUTH_REQUIRED");
  return user;
}

export async function requireUserId() { return (await requireUser()).id; }
