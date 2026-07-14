import "server-only";
import type { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { integer, normalizeSubscriptionStatus, parseVerifiedLemonWebhook, textValue, verifyLemonSignature } from "@/lib/billing/webhook";

const terminalStates = new Set(["processed", "ignored", "orphaned", "quarantined"]);
const paymentEvents = new Set(["subscription_payment_success", "subscription_payment_failed", "subscription_payment_recovered"]);

function now() { return new Date().toISOString(); }

export async function handleLemonWebhook(request: NextRequest) {
  const rawBody = await request.text();
  if (!verifyLemonSignature(rawBody, request.headers.get("x-signature"))) {
    return { status: 401, body: { error: "INVALID_SIGNATURE" } };
  }

  let event;
  try { event = parseVerifiedLemonWebhook(rawBody); }
  catch (error) {
    const message = error instanceof Error ? error.message : "INVALID_WEBHOOK_PAYLOAD";
    return { status: message === "INVALID_WEBHOOK_STORE" ? 403 : 400, body: { error: message } };
  }

  const admin = createSupabaseAdminClient();
  const existing = await admin.from("altr_billing_webhook_events")
    .select("id,processing_status,attempt_count")
    .eq("provider", "lemon_squeezy").eq("payload_hash", event.payloadHash).maybeSingle();
  if (existing.error) return { status: 500, body: { error: "WEBHOOK_STORAGE_FAILED" } };
  if (terminalStates.has(existing.data?.processing_status ?? "")) return { status: 200, body: { ok: true, duplicate: true } };

  const eventRow = {
    provider: "lemon_squeezy", provider_event_id: event.objectId, event_name: event.eventName,
    object_type: event.objectType, object_id: event.objectId, payload_hash: event.payloadHash,
    payload: event.raw, signature_valid: true, processing_status: "processing", orphaned: false,
    attempt_count: Number(existing.data?.attempt_count ?? 0) + 1, last_attempt_at: now(), error: null,
  };
  const stored = existing.data?.id
    ? await admin.from("altr_billing_webhook_events").update(eventRow).eq("id", existing.data.id)
    : await admin.from("altr_billing_webhook_events").insert(eventRow);
  if (stored.error) return { status: 500, body: { error: "WEBHOOK_STORAGE_FAILED" } };

  const finish = async (processing_status: string, error: string | null, orphaned = false) => {
    await admin.from("altr_billing_webhook_events").update({ processing_status, error, orphaned, processed_at: processing_status === "failed" ? null : now() })
      .eq("provider", "lemon_squeezy").eq("payload_hash", event.payloadHash);
  };

  try {
    const a = event.attributes;
    const subscriptionId = textValue(a.subscription_id) ?? (event.objectType.includes("subscription") ? event.objectId : null);
    const customerId = textValue(a.customer_id);
    const orderId = textValue(a.order_id) ?? (event.eventName.startsWith("order_") ? event.objectId : null);

    let userId = event.customUserId;
    if (!userId && subscriptionId) {
      const rel = await admin.from("altr_subscriptions").select("user_id").eq("provider", "lemon_squeezy").eq("provider_subscription_id", subscriptionId).maybeSingle();
      userId = rel.data?.user_id ?? null;
    }
    if (!userId && customerId) {
      const rel = await admin.from("altr_subscriptions").select("user_id").eq("provider", "lemon_squeezy").eq("provider_customer_id", customerId).order("updated_at", { ascending: false }).limit(1).maybeSingle();
      userId = rel.data?.user_id ?? null;
    }
    if (!userId) { await finish("orphaned", "TRUSTED_USER_RELATION_NOT_FOUND", true); return { status: 200, body: { ok: true, orphaned: true } }; }
    if (!event.planId || !event.variantId) { await finish("quarantined", "UNKNOWN_VARIANT"); return { status: 200, body: { ok: true, quarantined: true } }; }

    if (event.eventName.startsWith("subscription_")) {
      const trustedSubscriptionId = subscriptionId ?? event.objectId;
      const status = normalizeSubscriptionStatus(event.eventName, a.status);
      const row = {
        user_id: userId, provider: "lemon_squeezy", provider_subscription_id: trustedSubscriptionId,
        provider_customer_id: customerId, provider_order_id: orderId,
        lemon_squeezy_subscription_id: trustedSubscriptionId, lemon_squeezy_customer_id: customerId,
        lemon_squeezy_order_id: orderId, store_id: event.storeId, product_id: textValue(a.product_id),
        variant_id: event.variantId, plan: event.planId, plan_id: event.planId, status,
        renews_at: textValue(a.renews_at), ends_at: textValue(a.ends_at), trial_ends_at: textValue(a.trial_ends_at),
        cancelled: status === "cancelled", test_mode: event.testMode, raw_payload: event.raw,
      };
      const current = await admin.from("altr_subscriptions").select("id").eq("provider", "lemon_squeezy").eq("provider_subscription_id", trustedSubscriptionId).maybeSingle();
      const write = current.data?.id ? await admin.from("altr_subscriptions").update(row).eq("id", current.data.id) : await admin.from("altr_subscriptions").insert(row);
      if (write.error) throw write.error;
    }

    if (event.eventName === "order_created" || event.eventName === "order_refunded") {
      const refunded = event.eventName === "order_refunded";
      const trustedOrderId = orderId ?? event.objectId;
      const firstItem = a.first_order_item && typeof a.first_order_item === "object" ? a.first_order_item as Record<string, unknown> : {};
      const urls = a.urls && typeof a.urls === "object" ? a.urls as Record<string, unknown> : {};
      const orderWrite = await admin.from("altr_billing_orders").upsert({
        user_id: userId, provider: "lemon_squeezy", provider_order_id: trustedOrderId,
        provider_customer_id: customerId, store_id: event.storeId, product_id: textValue(firstItem.product_id),
        variant_id: event.variantId, plan_id: event.planId, status: refunded ? "refunded" : textValue(a.status) ?? "paid",
        amount: integer(a.total), currency: textValue(a.currency) ?? "USD", test_mode: event.testMode,
        receipt_url: textValue(urls.receipt), raw_payload: event.raw, ordered_at: textValue(a.created_at),
      }, { onConflict: "provider,provider_order_id" });
      if (orderWrite.error) throw orderWrite.error;
      const invoiceWrite = await admin.from("altr_billing_invoices").upsert({
        user_id: userId, provider: "lemon_squeezy", provider_invoice_id: event.objectId, provider_order_id: trustedOrderId,
        status: refunded ? "refunded" : "paid", amount: integer(a.total), currency: textValue(a.currency) ?? "USD",
        receipt_url: textValue(urls.receipt), issued_at: textValue(a.created_at), paid_at: refunded ? null : now(), raw_payload: event.raw,
      }, { onConflict: "provider,provider_invoice_id" });
      if (invoiceWrite.error) throw invoiceWrite.error;
    }

    if (paymentEvents.has(event.eventName)) {
      const urls = a.urls && typeof a.urls === "object" ? a.urls as Record<string, unknown> : {};
      const paid = event.eventName !== "subscription_payment_failed";
      const write = await admin.from("altr_billing_invoices").upsert({
        user_id: userId, provider: "lemon_squeezy", provider_invoice_id: event.objectId, provider_order_id: orderId,
        status: paid ? "paid" : "failed", amount: integer(a.total), currency: textValue(a.currency) ?? "USD",
        receipt_url: textValue(urls.receipt), issued_at: textValue(a.created_at), paid_at: paid ? now() : null, raw_payload: event.raw,
      }, { onConflict: "provider,provider_invoice_id" });
      if (write.error) throw write.error;
    }

    const audit = await admin.from("altr_audit_events").insert({ user_id: userId, actor_type: "service", event_type: `billing.${event.eventName}`, entity_type: event.objectType, entity_id: event.objectId, metadata: { plan_id: event.planId, variant_id: event.variantId, test_mode: event.testMode } });
    if (audit.error) throw audit.error;
    await finish("processed", null);
    return { status: 200, body: { ok: true } };
  } catch (error) {
    await finish("failed", error instanceof Error ? error.message.slice(0, 500) : "WEBHOOK_PROCESSING_FAILED");
    return { status: 500, body: { error: "WEBHOOK_PROCESSING_FAILED" } };
  }
}
