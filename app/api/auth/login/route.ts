import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { getProfileForUser } from "@/lib/profileServer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw error ?? new Error("LOGIN_FAILED");
    await createSupabaseAdminClient().from("altr_audit_logs").insert({ user_id: data.user.id, event_type: "auth.login", metadata: { provider: "password" } });
    return NextResponse.json({ profile: await getProfileForUser(data.user) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "LOGIN_FAILED" }, { status: 401 });
  }
}
