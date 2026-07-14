import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  reason: z.string().trim().max(500).optional(),
  conversationProcessing: z.boolean().default(false),
  aiMemory: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const input = schema.parse(await request.json());
    if (!input.conversationProcessing && !input.aiMemory) {
      return NextResponse.json({ error: "NO_CONSENT_SELECTED" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: consent, error } = await admin
      .from("altr_consents")
      .select("id,policy_version,terms_accepted_at,conversation_processing_accepted_at,ai_memory_accepted_at,locale,ip_address,user_agent")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !consent) return NextResponse.json({ error: "CONSENT_RECORD_NOT_FOUND" }, { status: 404 });

    const now = new Date().toISOString();
    const userAgent = request.headers.get("user-agent") ?? consent.user_agent;
    await admin.from("altr_consent_history").insert({
      user_id: user.id,
      consent_id: consent.id,
      event_type: "withdrawn",
      policy_version: consent.policy_version,
      terms_accepted: Boolean(consent.terms_accepted_at),
      conversation_processing_accepted: input.conversationProcessing ? false : Boolean(consent.conversation_processing_accepted_at),
      ai_memory_accepted: input.aiMemory ? false : Boolean(consent.ai_memory_accepted_at),
      locale: consent.locale,
      ip_address: consent.ip_address,
      user_agent: userAgent,
      reason: input.reason ?? null,
    });

    const events = [];
    if (input.conversationProcessing) events.push("conversation_processing");
    if (input.aiMemory) events.push("ai_memory");
    await admin.from("altr_consent_events").insert(
      events.map((consentType) => ({
        user_id: user.id,
        consent_type: consentType,
        event_type: "withdrawn",
        policy_version: consent.policy_version,
        granted: false,
        locale: consent.locale,
        ip_address: consent.ip_address,
        user_agent: userAgent,
        reason: input.reason ?? null,
        created_at: now,
      })),
    );

    await admin
      .from("altr_consents")
      .update({ withdrawn_at: now, withdrawal_reason: input.reason ?? null, updated_at: now })
      .eq("id", consent.id);

    await admin.from("altr_audit_events").insert({
      user_id: user.id,
      actor_type: "user",
      event_type: "consent.withdrawn",
      entity_type: "consent",
      metadata: { consentTypes: events },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "CONSENT_WITHDRAWAL_FAILED" }, { status: 400 });
  }
}
