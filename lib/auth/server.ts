import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getOptionalUser(): Promise<User | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getOptionalUser();
  if (!user) redirect("/auth?mode=login&next=/dashboard");
  return user;
}

export async function requireUserId(): Promise<string> {
  return (await requireUser()).id;
}
