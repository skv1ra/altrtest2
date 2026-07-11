import { NextRequest, NextResponse } from "next/server";
import { decodeData, verifySignature } from "@/lib/liqpay";
import { getBillingPlan } from "@/lib/plans";
import { sendPaymentEmail } from "@/lib/email";
import { getAppUrl } from "@/lib/liqpay";
import { isSupabaseConfigured, markPaymentFromCallback, upsertInvoice, upsertProfile, upsertSubscription } from "@/lib/supabaseServer";
import type { PlanId } from "@/lib/auth";

type LiqPayCallback = {
  status?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  description?: string;
  customer?: string;
  sender_email?: string;
  subscribe_id?: string;
};

const successfulStatuses = new Set(["success", "sandbox", "subscribed"]);

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const data = String(formData.get("data") ?? "");
  const signature = String(formData.get("signature") ?? "");

  if (!data || !signature) {
    return NextResponse.json({ error: "Missing data or signature" }, { status: 400 });
  }

  if (!verifySignature(data, signature)) {
    return NextResponse.json({ error: "Invalid LiqPay signature" }, { status: 401 });
  }

  const payment = decodeData<LiqPayCallback>(data);
  const orderId = payment.order_id ?? "";
  const planId = (orderId.split("_")[1] || "personal") as PlanId;
  const plan = getBillingPlan(planId);
  const status = payment.status ?? "unknown";

  const email = payment.customer || payment.sender_email || null;
  const amount = Number(payment.amount ?? plan.price);
  const currency = payment.currency ?? plan.currency;
  const paidAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  if (isSupabaseConfigured()) {
    await upsertProfile(email);
    await markPaymentFromCallback({
      order_id: orderId,
      email,
      plan: plan.id as Exclude<PlanId, "free">,
      amount,
      currency,
      status,
      auto_renew: Boolean(payment.subscribe_id),
      provider: "liqpay",
      provider_subscription_id: payment.subscribe_id ?? null,
      raw_payload: payment as unknown as Record<string, string | number | boolean | null>,
      paid_at: successfulStatuses.has(status) ? paidAt : null,
    });
  }

  if (successfulStatuses.has(status)) {
    if (isSupabaseConfigured() && email) {
      await upsertSubscription({
        email,
        plan: plan.id,
        status: "active",
        started_at: paidAt,
        expires_at: expiresAt,
        auto_renew: true,
        provider: "liqpay",
        order_id: orderId,
        provider_subscription_id: payment.subscribe_id ?? null,
      });
      await upsertInvoice({
        order_id: orderId,
        email,
        plan: plan.id as Exclude<PlanId, "free">,
        amount,
        currency,
        status: "paid",
        receipt_url: `${getAppUrl()}/payment/receipt/${encodeURIComponent(orderId)}`,
        paid_at: paidAt,
      });
    }

    await sendPaymentEmail({
      to: email ?? undefined,
      planName: plan.name,
      amount,
      currency,
      orderId,
    });
  } else {
    if (isSupabaseConfigured() && email) {
      await upsertInvoice({
        order_id: orderId,
        email,
        plan: plan.id as Exclude<PlanId, "free">,
        amount,
        currency,
        status: "failed",
      });
    }
    console.log("[LiqPay payment not successful]", payment);
  }

  return NextResponse.json({ ok: true });
}
