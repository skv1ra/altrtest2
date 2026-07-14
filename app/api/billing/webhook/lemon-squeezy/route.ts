import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { planFromVariantId, verifyWebhookSignature } from "@/lib/lemonSqueezy";

const subscriptionStatuses = new Set([
  "on_trial",
  "active",
  "paused",
  "past_due",
  "unpaid",
  "cancelled",
  "expired",
]);

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
  const signatureValid = await verifyWebhookSignature(rawBody, signature);

  if (!signatureValid) {
    return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 401 });
  }

  const payloadHash = createHash("sha256").update(rawBody).digest("hex");
  const event = JSON.parse(rawBody);
  const eventName = textValue(event?.meta?.event_name) ?? "unknown";
  const eventId = textValue(event?.data?.id);
  const attributes = event?.data?.attributes ?? {};
  const custom = event?.meta?.custom_data ?? attributes?.custom_data ?? {};
  const userId = textValue(custom?.supabase_user_id);
  const variantId = textValue(attributes?.variant_id ?? event?.data?.relationships?.variant?.data?.id);
  const plan = planFromVariantId(variantId);
  const admin = createSupabaseAdminClient();

  const { data: existingEvent } = await admin
    .from("altr_billing_webhook_events")
    .select("id,processing_status")
    .eq("provider", "lemon_squeezy")
    .eq("payload_hash", payloadHash)
    .maybeSingle();

  if (existingEvent?.processing_status === "processed") {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const webhookRow = {
    provider: "lemon_squeezy",
    provider_event_id: eventId,
    event_name: eventName,
    payload_hash: payloadHash,
    payload: event,
    signature_valid: true,
    processing_status: "received",
  };

  if (existingEvent?.id) {
    await admin.from("altr_billing_webhook_events").update(webhookRow).eq("id", existingEvent.id);
  } else {
    await admin.from("altr_billing_webhook_events").insert(webhookRow);
  }

  try {
    if (!userId || !plan) {
      await admin
        .from("altr_billing_webhook_events")
        .update({ processing_status: "ignored", processed_at: new Date().toISOString(), error: "MISSING_USER_OR_PLAN" })
        .eq("payload_hash", payloadHash);
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (eventName.startsWith("subscription_")) {
      const subscriptionId = textValue(event?.data?.id);
      const providerStatus = textValue(attributes.status) ?? "expired";
      const status = subscriptionStatuses.has(providerStatus) ? providerStatus : "expired";
      const row = {
        user_id: userId,
        plan,
        plan_id: plan,
        status,
        provider: "lemon_squeezy",
        provider_customer_id: textValue(attributes.customer_id),
        provider_subscription_id: subscriptionId,
        provider_order_id: textValue(attributes.order_id),
        lemon_squeezy_customer_id: textValue(attributes.customer_id),
        lemon_squeezy_subscription_id: subscriptionId,
        lemon_squeezy_order_id: textValue(attributes.order_id),
        store_id: textValue(attributes.store_id),
        product_id: textValue(attributes.product_id),
        variant_id: variantId,
        renews_at: textValue(attributes.renews_at),
        ends_at: textValue(attributes.ends_at),
        trial_ends_at: textValue(attributes.trial_ends_at),
        cancelled: status === "cancelled",
        test_mode: Boolean(attributes.test_mode),
        raw_payload: event,
      };

      const existing = subscriptionId
        ? await admin.from("altr_subscriptions").select("id").eq("provider_subscription_id", subscriptionId).maybeSingle()
        : { data: null };

      if (existing.data?.id) await admin.from("altr_subscriptions").update(row).eq("id", existing.data.id);
      else await admin.from("altr_subscriptions").insert(row);
    }

    if (eventName === "order_created") {
      const orderId = textValue(event?.data?.id);
      const orderRow = {
        user_id: userId,
        provider: "lemon_squeezy",
        provider_order_id: orderId,
        provider_customer_id: textValue(attributes.customer_id),
        store_id: textValue(attributes.store_id),
        product_id: textValue(attributes.first_order_item?.product_id),
        variant_id: variantId,
        plan_id: plan,
        status: textValue(attributes.status) ?? "paid",
        amount: numberValue(attributes.total),
        currency: textValue(attributes.currency) ?? "USD",
        test_mode: Boolean(attributes.test_mode),
        receipt_url: textValue(attributes.urls?.receipt),
        raw_payload: event,
        ordered_at: textValue(attributes.created_at),
      };

      await admin.from("altr_billing_orders").upsert(orderRow, { onConflict: "provider,provider_order_id" });
      await admin.from("altr_billing_invoices").insert({
        user_id: userId,
        provider: "lemon_squeezy",
        provider_order_id: orderId,
        status: "paid",
        amount: numberValue(attributes.total),
        currency: textValue(attributes.currency) ?? "USD",
        receipt_url: textValue(attributes.urls?.receipt),
        issued_at: textValue(attributes.created_at),
        paid_at: new Date().toISOString(),
        raw_payload: event,
      });
    }

    await admin.from("altr_audit_events").insert({
      user_id: userId,
      actor_type: "service",
      event_type: `billing.${eventName}`,
      entity_type: "billing_webhook_event",
      metadata: { plan, variantId, payloadHash },
    });

    await admin
      .from("altr_billing_webhook_events")
      .update({ processing_status: "processed", processed_at: new Date().toISOString(), error: null })
      .eq("payload_hash", payloadHash);

    return NextResponse.json({ ok: true });
  } catch (error) {
    await admin
      .from("altr_billing_webhook_events")
      .update({
        processing_status: "failed",
        processed_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : "WEBHOOK_PROCESSING_FAILED",
      })
      .eq("payload_hash", payloadHash);

    return NextResponse.json({ error: "WEBHOOK_PROCESSING_FAILED" }, { status: 500 });
  }
}
