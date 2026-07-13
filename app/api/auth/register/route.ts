import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { getProfileForUser, ensureProfile } from "@/lib/profileServer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const policyVersion = typeof body.policyVersion === "string" ? body.policyVersion : "";

    if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "INVALID_EMAIL" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "PASSWORD_TOO_SHORT" }, { status: 400 });
    if (name.length < 2) return NextResponse.json({ error: "NAME_REQUIRED" }, { status: 400 });

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (error) throw error;
    if (!data.user) return NextResponse.json({ error: "REGISTRATION_PENDING_CONFIRMATION" }, { status: 202 });

    await ensureProfile(data.user, name);
    const admin = createSupabaseAdminClient();
    await admin.from("altr_consents").insert({
      user_id: data.user.id,
      policy_version: policyVersion || "2026-07-13",
      terms_accepted_at: new Date().toISOString(),
      conversation_processing_accepted_at: new Date().toISOString(),
      ai_memory_accepted_at: new Date().toISOString(),
    });
    await admin.from("altr_audit_logs").insert({ user_id: data.user.id, event_type: "auth.registered", metadata: { provider: "password" } });

    return NextResponse.json({ profile: await getProfileForUser(data.user) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "REGISTER_FAILED" }, { status: 500 });
  }
}
