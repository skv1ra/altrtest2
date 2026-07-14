import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";

export { createSupabaseAdminClient } from "@/lib/supabase/admin";

export function createSupabaseServerClient() {
  const env = getPublicEnv();
  const cookieStore = cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies. Middleware refreshes the session.
        }
      },
    },
  });
}

export async function getOptionalUser(): Promise<User | null> {
  const { data, error } = await createSupabaseServerClient().auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getOptionalUser();
  if (!user) throw new Error("AUTH_REQUIRED");
  return user;
}

export async function requireUserId(): Promise<string> {
  return (await requireUser()).id;
}
