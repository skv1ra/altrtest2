import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/profileServer";
import { getAppUrl } from "@/lib/env";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const redirect = new URL("/dashboard", getAppUrl());
  if (!code) return NextResponse.redirect(new URL("/auth?mode=login&error=missing_code", getAppUrl()));

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(new URL("/auth?mode=login&error=oauth_failed", getAppUrl()));

  await ensureProfile(data.user, data.user.user_metadata?.full_name ?? null);
  await createSupabaseAdminClient().from("altr_audit_logs").insert({ user_id: data.user.id, event_type: "auth.login", metadata: { provider: "google" } });
  return NextResponse.redirect(redirect);
}
