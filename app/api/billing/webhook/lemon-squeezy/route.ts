import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { planFromVariantId, verifyWebhookSignature } from "@/lib/lemonSqueezy";

function textValue(value: unknown) {
  return value == null ? null : String(value);
}

function numberValue(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!(await verifyWebhookSignature(rawBody, signature))) {
    return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const eventName = textValue(event?.meta?.event_name);
  const attributes = event?.data?.attributes ?? {};
  const custom = event?.meta?.custom_data ?? attributes?.custom_data ?? {};
  const userId = textValue(custom?.supabase_user_id);
  const variantId = textValue(attributes?.variant_id ?? event?.data?.relationships?.variant?.data?.id);
  const plan = planFromVariantId(variantId);

  if (!userId || !plan) {
    return NextResponse.json({ error: "MISSING_USER_OR_PLAN" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  if (eventName?.startsWith("subscription_")) {
    const providerStatus = textValue(attributes.status) ?? "inactive";
    const status = providerStatus === "active" ? "active" : providerStatus === "past_due" ? "past_due" : providerStatus === "cancelled" ? "cancelled" : providerStatus === "expired" ? "expired" : "inactive";
    await admin.from("altr_subscriptions").upsert({
      user_id: userId,
      plan,
      status,
      provider: "lemon_squeezy",
      lemon_squeezy_customer_id: textValue(attributes.customer_id),
      lemon_squeezy_subscription_id: textValue(event?.data?.id),
      lemon_squeezy_order_id: textValue(attributes.order_id),
      variant_id: variantId,
      renews_at: textValue(attributes.renews_at),
      ends_at: textValue(attributes.ends_at),
      raw_payload: event,
    }, { onConflict: "lemon_squeezy_subscription_id" });

    await admin.from("altr_audit_logs").insert({ user_id: userId, event_type: `billing.${eventName}`, metadata: { plan, status, variantId } });
  }

  if (eventName === "order_created") {
    await admin.from("altr_invoices").upsert({
      user_id: userId,
      provider: "lemon_squeezy",
      lemon_squeezy_order_id: textValue(event?.data?.id),
      amount: numberValue(attributes.total),
      currency: textValue(attributes.currency) ?? "USD",
      status: "paid",
      receipt_url: textValue(attributes.urls?.receipt),
      paid_at: new Date().toISOString(),
      raw_payload: event,
    }, { onConflict: "lemon_squeezy_order_id" });

    await admin.from("altr_audit_logs").insert({ user_id: userId, event_type: "billing.invoice_paid", metadata: { plan, variantId } });
  }

  return NextResponse.json({ ok: true });
}
