import { NextRequest, NextResponse } from "next/server";
import { assertAuthRateLimit, getRequestIdentity } from "@/lib/auth/rate-limit";
import { getFreshCustomerPortalUrl } from "@/lib/billing/lemonsqueezy";
import { safeErrorResponse } from "@/lib/security/observability";
import { createSupabaseAdminClient, requireUser } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    await assertAuthRateLimit("billing_portal", getRequestIdentity(request, user.id));

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("altr_subscriptions")
      .select("provider_subscription_id")
      .eq("user_id", user.id)
      .eq("provider", "lemon_squeezy")
      .not("provider_subscription_id", "is", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data?.provider_subscription_id) {
      return NextResponse.json({ error: "SUBSCRIPTION_NOT_FOUND" }, { status: 404 });
    }

    const portalUrl = await getFreshCustomerPortalUrl(data.provider_subscription_id);
    await admin.from("altr_audit_events").insert({
      user_id: user.id,
      actor_type: "user",
      event_type: "billing.portal_created",
      entity_type: "subscription",
      metadata: { request_id: request.headers.get("x-request-id") },
    });
    return NextResponse.json({ portalUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PORTAL_FAILED";
    const status = message === "RATE_LIMITED" ? 429 : message === "AUTH_REQUIRED" ? 401 : 500;
    return safeErrorResponse(request, error, {
      code: status === 429 ? "RATE_LIMITED" : status === 401 ? "AUTH_REQUIRED" : "PORTAL_FAILED",
      status,
    });
  }
}
