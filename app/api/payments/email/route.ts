import { NextRequest, NextResponse } from "next/server";
import { sendPaymentEmail } from "@/lib/email";
import { getBillingPlan } from "@/lib/plans";
import type { PlanId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const plan = getBillingPlan((body.plan ?? "personal") as PlanId);
  const result = await sendPaymentEmail({
    to: body.email,
    planName: plan.name,
    amount: Number(body.amount ?? plan.price),
    currency: body.currency ?? plan.currency,
    orderId: body.orderId ?? "manual",
  });
  return NextResponse.json({ ok: true, result });
}
