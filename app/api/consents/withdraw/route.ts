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
      user_agent: request.headers.get("user-agent") ?? consent.user_agent,
      reason: input.reason ?? null,
    });

    await admin.from("altr_consents").update({ withdrawn_at: now, withdrawal_reason: input.reason ?? null, updated_at: now }).eq("id", consent.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "CONSENT_WITHDRAWAL_FAILED" }, { status: 400 });
  }
}
