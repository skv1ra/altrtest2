import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAppUrl, encodeData, createSignature } from "@/lib/liqpay";
import { getBillingPlan } from "@/lib/plans";
import { createPendingPayment, isSupabaseConfigured, upsertProfile } from "@/lib/supabaseServer";
import type { PlanId } from "@/lib/auth";

const paidPlans: PlanId[] = ["personal", "work"];

function makeOrderId(planId: PlanId) {
  const random = randomUUID();
  return `altr_${planId}_${random}`.slice(0, 96);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const planId = body.planId as PlanId;
    const email = typeof body.email === "string" ? body.email : undefined;
    const autoRenew = body.autoRenew !== false;

    if (!paidPlans.includes(planId)) {
      return NextResponse.json({ error: "Invalid paid plan" }, { status: 400 });
    }

    const publicKey = process.env.LIQPAY_PUBLIC_KEY;
    if (!publicKey) {
      return NextResponse.json({ error: "LIQPAY_PUBLIC_KEY is not configured" }, { status: 500 });
    }

    const plan = getBillingPlan(planId);
    const orderId = makeOrderId(planId);
    const appUrl = getAppUrl();
    const description = `Altr ${plan.name} subscription — 30 days${autoRenew ? " with auto-renewal" : ""}`;

    const payload: Record<string, string | number> = {
      version: 3,
      public_key: publicKey,
      action: autoRenew ? "subscribe" : "pay",
      amount: plan.price,
      currency: plan.currency,
      description,
      order_id: orderId,
      result_url: `${appUrl}/payment/success?order_id=${encodeURIComponent(orderId)}&plan=${plan.id}`,
      server_url: `${appUrl}/api/payments/liqpay/callback`,
    };

    if (email) {
      payload.customer = email;
    }

    if (autoRenew) {
      payload.subscribe = 1;
      payload.subscribe_periodicity = "month";
    }

    if (isSupabaseConfigured()) {
      await upsertProfile(email);
      await createPendingPayment({
        order_id: orderId,
        email,
        plan: plan.id as Exclude<PlanId, "free">,
        amount: plan.price,
        currency: plan.currency,
        status: "pending",
        auto_renew: autoRenew,
        provider: "liqpay",
        raw_payload: payload,
      });
    }

    const data = encodeData(payload);
    const signature = createSignature(data);

    return NextResponse.json({
      data,
      signature,
      orderId,
      plan: plan.id,
      amount: plan.price,
      currency: plan.currency,
      autoRenew,
      checkoutUrl: "https://www.liqpay.ua/api/3/checkout",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment creation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
