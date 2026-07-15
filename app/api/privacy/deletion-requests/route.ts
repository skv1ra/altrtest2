import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAuthRateLimit, getRequestIdentity } from "@/lib/auth/rate-limit";
import { getServerEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getOptionalUser } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().trim().email().max(320).transform((value) => value.toLowerCase()),
  scope: z.enum(["all", "account", "conversations", "memory"]),
  reason: z.string().trim().max(2000).optional().default(""),
  confirmed: z.literal(true),
});

async function notifyPrivacyInbox(reference: string, scope: string) {
  const env = getServerEnv();
  if (!env.RESEND_API_KEY || !env.PRIVACY_EMAIL || !env.DELETION_REQUEST_EMAIL_FROM) return;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.DELETION_REQUEST_EMAIL_FROM,
      to: [env.PRIVACY_EMAIL],
      subject: `Altr privacy deletion request ${reference}`,
      text: `A deletion request was received. Reference: ${reference}. Scope: ${scope}. Review it in the protected privacy workflow.`,
    }),
  });
  if (!response.ok) console.error("Privacy notification failed", response.status);
}

export async function POST(request: NextRequest) {
  try {
    const input = schema.parse(await request.json());
    await assertAuthRateLimit("privacy_request", getRequestIdentity(request, input.email));

    const user = await getOptionalUser();
    const authenticatedMatch = Boolean(user?.email && user.email.toLowerCase() === input.email);
    const verified = authenticatedMatch && Boolean(user?.email_confirmed_at);
    const reference = `DEL-${randomBytes(6).toString("hex").toUpperCase()}`;
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.from("altr_deletion_requests").insert({
      user_id: authenticatedMatch ? user!.id : null,
      email: input.email,
      email_verified: verified,
      requested_scope: input.scope,
      request_type: input.scope === "all" || input.scope === "account" ? "full_account" : "selected_data",
      reason: input.reason || null,
      status: "requested",
      public_reference: reference,
      source: authenticatedMatch ? "authenticated" : "public",
      verification_state: verified ? "verified" : "pending",
      metadata: { support_email_configured: Boolean(getServerEnv().SUPPORT_EMAIL) },
    }).select("id").single();
    if (error || !data) throw new Error("REQUEST_CREATE_FAILED");

    await admin.from("altr_deletion_request_history").insert({
      request_id: data.id,
      actor_type: authenticatedMatch ? "user" : "public",
      actor_user_id: authenticatedMatch ? user!.id : null,
      to_status: "requested",
      metadata: { scope: input.scope, email_verified: verified },
    });
    await notifyPrivacyInbox(reference, input.scope);

    return NextResponse.json({
      ok: true,
      reference,
      message: "Запит прийнято. Якщо адреса пов’язана з акаунтом, команда privacy виконає необхідну перевірку.",
    }, { status: 202 });
  } catch (error) {
    const status = error instanceof Error && error.message === "RATE_LIMITED" ? 429 : 400;
    return NextResponse.json({
      error: status === 429 ? "Забагато запитів. Спробуйте пізніше." : "Не вдалося прийняти запит. Перевірте введені дані.",
    }, { status });
  }
}
