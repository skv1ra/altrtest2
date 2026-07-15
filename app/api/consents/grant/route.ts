import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { LEGAL_VERSION } from "@/lib/legal";

const schema = z.object({
  conversationProcessing: z.boolean().default(false),
  aiMemory: z.boolean().default(false),
  locale: z.string().trim().min(2).max(40).default("en"),
}).strict();

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const input = schema.parse(await request.json());
    if (!input.conversationProcessing && !input.aiMemory) {
      return NextResponse.json({ error: "NO_CONSENT_SELECTED" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const now = new Date().toISOString();
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const userAgent = request.headers.get("user-agent");
    const { data: current, error: currentError } = await admin
      .from("altr_consents")
      .select("id,terms_accepted_at,conversation_processing_accepted_at,ai_memory_accepted_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (currentError) throw currentError;

    const values = {
      user_id: user.id,
      policy_version: LEGAL_VERSION,
      terms_accepted_at: current?.terms_accepted_at ?? now,
      conversation_processing_accepted_at: input.conversationProcessing ? now : current?.conversation_processing_accepted_at ?? null,
      ai_memory_accepted_at: input.aiMemory ? now : current?.ai_memory_accepted_at ?? null,
      locale: input.locale,
      ip_address: ipAddress,
      user_agent: userAgent,
      withdrawn_at: null,
      withdrawal_reason: null,
      updated_at: now,
    };

    const consentResult = current?.id
      ? await admin.from("altr_consents").update(values).eq("id", current.id).select("id").single()
      : await admin.from("altr_consents").insert(values).select("id").single();
    if (consentResult.error || !consentResult.data) throw consentResult.error ?? new Error("CONSENT_SAVE_FAILED");

    const types: Array<"conversation_processing" | "ai_memory"> = [];
    if (input.conversationProcessing) types.push("conversation_processing");
    if (input.aiMemory) types.push("ai_memory");
    await admin.from("altr_consent_events").insert(types.map((consentType) => ({
      user_id: user.id,
      consent_type: consentType,
      event_type: "accepted",
      policy_version: LEGAL_VERSION,
      granted: true,
      locale: input.locale,
      ip_address: ipAddress,
      user_agent: userAgent,
      created_at: now,
    })));

    await admin.from("altr_consent_history").insert({
      user_id: user.id,
      consent_id: consentResult.data.id,
      event_type: "updated",
      policy_version: LEGAL_VERSION,
      terms_accepted: true,
      conversation_processing_accepted: Boolean(values.conversation_processing_accepted_at),
      ai_memory_accepted: Boolean(values.ai_memory_accepted_at),
      locale: input.locale,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    await admin.from("altr_audit_events").insert({
      user_id: user.id,
      actor_type: "user",
      event_type: "consent.granted",
      entity_type: "consent",
      entity_id: consentResult.data.id,
      metadata: { consentTypes: types, policyVersion: LEGAL_VERSION },
    });

    return NextResponse.json({ ok: true, policyVersion: LEGAL_VERSION });
  } catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? "INVALID_CONSENT_REQUEST" : "CONSENT_GRANT_FAILED" }, { status: error instanceof z.ZodError ? 400 : 500 });
  }
}