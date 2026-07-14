import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { registerSchema } from "@/lib/auth/validation";
import { assertAuthRateLimit, getRequestIdentity } from "@/lib/auth/rate-limit";

const GENERIC_ERROR = "Не вдалося створити акаунт. Перевір дані й спробуй ще раз.";

export async function POST(request: NextRequest) {
  try {
    const input = registerSchema.parse(await request.json());
    await assertAuthRateLimit("register", getRequestIdentity(request, input.email));

    const origin = new URL(request.url).origin;
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/legacy-migration`,
        data: { full_name: input.name },
      },
    });
    if (error || !data.user) return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });

    const userId = data.user.id;
    const admin = createSupabaseAdminClient();
    await admin.from("altr_profiles").upsert({
      user_id: userId,
      email: input.email,
      name: input.name,
      locale: input.locale,
      updated_at: new Date().toISOString(),
    });

    const now = new Date().toISOString();
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const userAgent = request.headers.get("user-agent");
    const { data: consent } = await admin
      .from("altr_consents")
      .insert({
        user_id: userId,
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
      user_id: userId,
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

    await admin.from("altr_consent_events").insert(
      ["terms", "conversation_processing", "ai_memory"].map((consentType) => ({
        user_id: userId,
        consent_type: consentType,
        event_type: "accepted",
        policy_version: input.policyVersion,
        granted: true,
        locale: input.locale,
        ip_address: ipAddress,
        user_agent: userAgent,
        created_at: now,
      })),
    );

    await admin.from("altr_audit_events").insert({
      user_id: userId,
      actor_type: "user",
      event_type: "auth.registered",
      entity_type: "profile",
      entity_id: userId,
      metadata: { provider: "password", email_verification_required: !data.session },
    });

    const response = NextResponse.json(
      { ok: true, requiresEmailVerification: !data.session, next: data.session ? "/legacy-migration" : null },
      { status: data.session ? 200 : 202 },
    );
    if (data.session) {
      response.cookies.set("altr_legacy_review", "pending", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return response;
  } catch (error) {
    const status = error instanceof Error && error.message === "RATE_LIMITED" ? 429 : 400;
    return NextResponse.json({ error: status === 429 ? "Забагато спроб. Спробуй пізніше." : GENERIC_ERROR }, { status });
  }
}
