import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAuthRateLimit, getRequestIdentity } from "@/lib/auth/rate-limit";
import { createHostedCheckout } from "@/lib/billing/lemonsqueezy";
import { isPaidPlanId } from "@/lib/billing/plans";
import { createSupabaseAdminClient, requireUser } from "@/lib/supabase/server";

const checkoutSchema = z.object({ planId: z.enum(["personal", "work"]) }).strict();

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success || !isPaidPlanId(parsed.data.planId)) {
      return NextResponse.json({ error: "INVALID_PAID_PLAN" }, { status: 400 });
    }
    if (!user.email) return NextResponse.json({ error: "USER_EMAIL_REQUIRED" }, { status: 400 });

    await assertAuthRateLimit("billing_checkout", getRequestIdentity(request, user.id));
    const checkout = await createHostedCheckout({
      userId: user.id,
      email: user.email,
      name: String(user.user_metadata?.full_name ?? user.email.split("@")[0]),
      planId: parsed.data.planId,
    });

    await createSupabaseAdminClient().from("altr_audit_events").insert({
      user_id: user.id,
      actor_type: "user",
      event_type: "billing.checkout_created",
      entity_type: "checkout",
      metadata: { plan_id: parsed.data.planId, variant_id: checkout.variantId },
    });

    return NextResponse.json({ checkoutUrl: checkout.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CHECKOUT_FAILED";
    const status = message === "RATE_LIMITED" ? 429 : message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
