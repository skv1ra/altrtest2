import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { safeRedirectPath } from "@/lib/supabase/middleware";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeRedirectPath(request.nextUrl.searchParams.get("next"), "/dashboard");
  if (!code) return NextResponse.redirect(new URL("/auth?mode=login&error=callback", request.url));

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(new URL("/auth?mode=login&error=callback", request.url));

  await createSupabaseAdminClient().from("altr_profiles").upsert({
    user_id: data.user.id,
    email: data.user.email ?? "",
    name: data.user.user_metadata?.full_name ?? null,
    updated_at: new Date().toISOString(),
  });
  return NextResponse.redirect(new URL(next, request.url));
}