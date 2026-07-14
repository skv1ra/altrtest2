// @vitest-environment node

import { createHmac } from "crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { normalizeSubscriptionStatus, parseVerifiedLemonWebhook, verifyLemonSignature } from "@/lib/billing/webhook";

const env = {
  NEXT_PUBLIC_APP_URL: "https://altr.example",
  LEMONSQUEEZY_API_KEY: "test-lemon-key-at-least-20-characters",
  LEMONSQUEEZY_STORE_ID: "42",
  LEMONSQUEEZY_WEBHOOK_SECRET: "test-webhook-secret-at-least-20-characters",
  LEMONSQUEEZY_PERSONAL_VARIANT_ID: "1001",
  LEMONSQUEEZY_WORK_VARIANT_ID: "1002",
};

function payload(variantId: number | string = 1001) {
  return JSON.stringify({
    meta: {
      event_name: "subscription_created",
      custom_data: { user_id: "00000000-0000-4000-8000-000000000001", plan_id: "work" },
      test_mode: true,
    },
    data: {
      type: "subscriptions",
      id: "sub_1",
      attributes: { store_id: 42, variant_id: variantId, status: "active", customer_id: 5 },
    },
  });
}

describe("Lemon Squeezy webhook verification", () => {
  beforeEach(() => {
    for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("rejects missing and malformed signatures", () => {
    expect(verifyLemonSignature(payload(), null)).toBe(false);
    expect(verifyLemonSignature(payload(), "not-hex")).toBe(false);
  });

  it("accepts the exact raw-body HMAC", () => {
    const raw = payload();
    const signature = createHmac("sha256", env.LEMONSQUEEZY_WEBHOOK_SECRET).update(raw).digest("hex");
    expect(verifyLemonSignature(raw, signature)).toBe(true);
    expect(verifyLemonSignature(raw + " ", signature)).toBe(false);
  });

  it("maps the allowlisted variant instead of trusting custom plan_id", () => {
    const parsed = parseVerifiedLemonWebhook(payload(1001));
    expect(parsed.planId).toBe("personal");
    expect(parsed.customUserId).toBe("00000000-0000-4000-8000-000000000001");
  });

  it("quarantines unknown variants through a null plan mapping", () => {
    expect(parseVerifiedLemonWebhook(payload(9999)).planId).toBeNull();
  });

  it("normalizes lifecycle event statuses explicitly", () => {
    expect(normalizeSubscriptionStatus("subscription_paused", null)).toBe("paused");
    expect(normalizeSubscriptionStatus("subscription_payment_failed", null)).toBe("past_due");
    expect(normalizeSubscriptionStatus("subscription_payment_recovered", null)).toBe("active");
    expect(normalizeSubscriptionStatus("subscription_expired", null)).toBe("expired");
  });
});
