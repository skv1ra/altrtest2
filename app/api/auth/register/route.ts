import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { registerSchema } from "@/lib/auth/validation";
import { assertAuthRateLimit, getRequestIdentity } from "@/lib/auth/rate-limit";

const GENERIC_ERROR = "Не вдалося створити акаунт. Перевір дані й спробуй ще раз.";

export async function POST(request: NextRequest) {
  try {
    const input = registerSchema.parse(await request.json());
    const identity = getRequestIdentity(request, input.email);
    await assertAuthRateLimit("register", identity);

    const origin = new URL(request.url).origin;
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
        data: { full_name: input.name },
      },
    });
    if (error || !data.user) return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });

    const admin = createSupabaseAdminClient();
    await admin.from("altr_profiles").upsert({
      user_id: data.user.id,
      email: input.email,
      name: input.name,
      updated_at: new Date().toISOString(),
    });

    const now = new Date().toISOString();
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const userAgent = request.headers.get("user-agent");
    const { data: consent } = await admin
      .from("altr_consents")
      .insert({
        user_id: data.user.id,
        policy_version: input.policyVersion,
        terms_accepted_at: now,
        conversation_processing_accepted_at: now,
        ai_memory_accepted_at: now,
        locale: input.locale,
        ip_address: ipAddress,
        user_agent: userAgent,
        updated_at: now,
      })
      .select("id")
      .single();

    await admin.from("altr_consent_history").insert({
      user_id: data.user.id,
      consent_id: consent?.id ?? null,
      event_type: "accepted",
      policy_version: input.policyVersion,
      terms_accepted: true,
      conversation_processing_accepted: true,
      ai_memory_accepted: true,
      locale: input.locale,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
    await admin.from("altr_audit_logs").insert({
      user_id: data.user.id,
      event_type: "auth.registered",
      metadata: { provider: "password", email_verification_required: !data.session },
    });

    return NextResponse.json({ ok: true, requiresEmailVerification: !data.session }, { status: data.session ? 200 : 202 });
  } catch (error) {
    const status = error instanceof Error && error.message === "RATE_LIMITED" ? 429 : 400;
    return NextResponse.json({ error: status === 429 ? "Забагато спроб. Спробуй пізніше." : GENERIC_ERROR }, { status });
  }
}