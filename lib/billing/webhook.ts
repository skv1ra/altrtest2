import "server-only";

import { createHash, createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";
import { getBillingEnv, planFromVariantId } from "@/lib/billing/lemonsqueezy";
import type { LemonSubscriptionStatus, PaidPlanId } from "@/lib/billing/types";

const uuidSchema = z.string().uuid();
const supportedEvents = new Set([
  "order_created",
  "order_refunded",
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_resumed",
  "subscription_expired",
  "subscription_paused",
  "subscription_unpaused",
  "subscription_payment_success",
  "subscription_payment_failed",
  "subscription_payment_recovered",
]);

const payloadSchema = z.object({
  meta: z.object({
    event_name: z.string().min(1),
    custom_data: z.record(z.unknown()).optional(),
    test_mode: z.boolean().optional(),
  }),
  data: z.object({
    type: z.string().min(1),
    id: z.union([z.string(), z.number()]),
    attributes: z.record(z.unknown()),
  }),
});

export type ParsedLemonWebhook = {
  raw: z.infer<typeof payloadSchema>;
  eventName: string;
  objectType: string;
  objectId: string;
  attributes: Record<string, unknown>;
  customData: Record<string, unknown>;
  payloadHash: string;
  storeId: string;
  variantId: string | null;
  planId: PaidPlanId | null;
  customUserId: string | null;
  testMode: boolean;
};

function text(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value);
}

export function verifyLemonSignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac("sha256", getBillingEnv().LEMONSQUEEZY_WEBHOOK_SECRET).update(rawBody).digest("hex");
  const left = Buffer.from(signature, "hex");
  const right = Buffer.from(expected, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function parseVerifiedLemonWebhook(rawBody: string): ParsedLemonWebhook {
  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    throw new Error("INVALID_WEBHOOK_JSON");
  }

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) throw new Error("INVALID_WEBHOOK_PAYLOAD");
  if (!supportedEvents.has(parsed.data.meta.event_name)) throw new Error("UNSUPPORTED_WEBHOOK_EVENT");

  const attributes = parsed.data.data.attributes;
  const storeId = text(attributes.store_id);
  if (!storeId || storeId !== String(getBillingEnv().LEMONSQUEEZY_STORE_ID)) throw new Error("INVALID_WEBHOOK_STORE");

  const variantId = text(attributes.variant_id);
  const planId = planFromVariantId(variantId);
  const custom = parsed.data.meta.custom_data ?? {};
  const customUser = text(custom.user_id);

  return {
    raw: parsed.data,
    eventName: parsed.data.meta.event_name,
    objectType: parsed.data.data.type,
    objectId: String(parsed.data.data.id),
    attributes,
    customData: custom,
    payloadHash: createHash("sha256").update(rawBody).digest("hex"),
    storeId,
    variantId,
    planId,
    customUserId: customUser && uuidSchema.safeParse(customUser).success ? customUser : null,
    testMode: Boolean(attributes.test_mode ?? parsed.data.meta.test_mode),
  };
}

export function normalizeSubscriptionStatus(eventName: string, value: unknown): LemonSubscriptionStatus {
  const status = text(value);
  if (["on_trial", "active", "paused", "past_due", "unpaid", "cancelled", "expired"].includes(status ?? "")) {
    return status as LemonSubscriptionStatus;
  }
  if (eventName === "subscription_cancelled") return "cancelled";
  if (eventName === "subscription_resumed" || eventName === "subscription_unpaused" || eventName === "subscription_payment_recovered") return "active";
  if (eventName === "subscription_expired") return "expired";
  if (eventName === "subscription_paused") return "paused";
  if (eventName === "subscription_payment_failed") return "past_due";
  return "active";
}

export function integer(value: unknown): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? Math.max(0, Math.trunc(number)) : 0;
}

export function textValue(value: unknown): string | null {
  return text(value);
}
