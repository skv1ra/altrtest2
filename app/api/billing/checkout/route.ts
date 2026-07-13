import { NextRequest, NextResponse } from "next/server";
import { requireUser, createSupabaseAdminClient } from "@/lib/supabase/server";
import { createCheckout, type PaidPlanId } from "@/lib/lemonSqueezy";

const paidPlans: PaidPlanId[] = ["personal", "work"];

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => ({}));
    const plan = body.planId as PaidPlanId;

    if (!paidPlans.includes(plan)) {
      return NextResponse.json({ error: "INVALID_PAID_PLAN" }, { status: 400 });
    }
    if (!user.email) {
      return NextResponse.json({ error: "USER_EMAIL_REQUIRED" }, { status: 400 });
    }

    const checkout = await createCheckout({ userId: user.id, email: user.email, plan });
    await createSupabaseAdminClient().from("altr_audit_logs").insert({
      user_id: user.id,
      event_type: "billing.checkout_created",
      metadata: { plan, variantId: checkout.variantId },
    });

    return NextResponse.json({ checkoutUrl: checkout.url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "CHECKOUT_FAILED" }, { status: 500 });
  }
}
