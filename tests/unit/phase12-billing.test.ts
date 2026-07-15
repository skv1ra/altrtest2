// @vitest-environment node
import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { parseCheckoutInput } from "@/lib/billing/checkout-validation";
import { resolveSubscriptionEntitlement } from "@/lib/billing/entitlement-policy";
import { planFromVariantId, variantIdForPlan } from "@/lib/billing/lemonsqueezy";
import { hasPlanAccess } from "@/lib/billing/plans";
import { parseVerifiedLemonWebhook, verifyLemonSignature } from "@/lib/billing/webhook";

const env = {
  NEXT_PUBLIC_APP_URL: "https://altr.example",
  LEMONSQUEEZY_API_KEY: "test-lemon-key-at-least-20-characters",
  LEMONSQUEEZY_STORE_ID: "42",
  LEMONSQUEEZY_WEBHOOK_SECRET: "test-webhook-secret-at-least-20-characters",
  LEMONSQUEEZY_PERSONAL_VARIANT_ID: "1001",
  LEMONSQUEEZY_WORK_VARIANT_ID: "1002",
};
const future = "2030-01-02T00:00:00.000Z";
const past = "2029-12-30T00:00:00.000Z";
const now = new Date("2030-01-01T00:00:00.000Z");
function payload(storeId: number | string = 42, variantId: number | string = 1001) {
  return JSON.stringify({ meta: { event_name: "subscription_created", custom_data: { user_id: "00000000-0000-4000-8000-000000000001" } }, data: { type: "subscriptions", id: "sub_1", attributes: { store_id: storeId, variant_id: variantId, status: "active" } } });
}

describe("plan hierarchy and checkout", () => {
  it.each([
    ["free", "free", true], ["free", "personal", false], ["free", "work", false],
    ["personal", "free", true], ["personal", "personal", true], ["personal", "work", false],
    ["work", "free", true], ["work", "personal", true], ["work", "work", true],
  ] as const)("%s access to %s is %s", (current, required, expected) => expect(hasPlanAccess(current, required)).toBe(expected));
  it("accepts only a strict paid plan ID", () => {
    expect(parseCheckoutInput({ planId: "personal" })).toEqual({ planId: "personal" });
    expect(parseCheckoutInput({ planId: "work" })).toEqual({ planId: "work" });
    for (const value of [{ planId: "free" }, { planId: 1001 }, { planId: "personal", price: 1 }, {}, null]) expect(() => parseCheckoutInput(value)).toThrow();
  });
});

describe("entitlements for every Lemon status", () => {
  it.each([
    ["on_trial", {}, true, "on_trial"],
    ["active", {}, true, "active"],
    ["paused", {}, false, "paused"],
    ["unpaid", {}, false, "unpaid"],
    ["expired", {}, false, "expired"],
    ["cancelled", { endsAt: future }, true, "cancelled_until_end"],
    ["cancelled", { endsAt: past }, false, "cancelled"],
    ["past_due", { pastDueGraceEndsAt: future }, true, "past_due_grace"],
    ["past_due", { pastDueGraceEndsAt: past }, false, "past_due"],
  ] as const)("resolves %s", (status, dates, premium, reason) => {
    expect(resolveSubscriptionEntitlement({ planId: "personal", status, ...dates }, now)).toMatchObject({ hasPremium: premium, reason, planId: premium ? "personal" : "free" });
  });
});

describe("Lemon variant and webhook verification", () => {
  beforeEach(() => Object.entries(env).forEach(([key, value]) => vi.stubEnv(key, value)));
  afterEach(() => vi.unstubAllEnvs());
  it("maps variants in both directions", () => {
    expect(variantIdForPlan("personal")).toBe(1001); expect(variantIdForPlan("work")).toBe(1002);
    expect(planFromVariantId(1001)).toBe("personal"); expect(planFromVariantId("1002")).toBe("work"); expect(planFromVariantId(9999)).toBeNull();
  });
  it("verifies the exact raw-body HMAC and rejects invalid signatures", () => {
    const raw = payload(); const signature = createHmac("sha256", env.LEMONSQUEEZY_WEBHOOK_SECRET).update(raw).digest("hex");
    expect(verifyLemonSignature(raw, signature)).toBe(true); expect(verifyLemonSignature(raw + " ", signature)).toBe(false); expect(verifyLemonSignature(raw, null)).toBe(false); expect(verifyLemonSignature(raw, "bad")).toBe(false);
  });
  it("rejects an unknown store", () => expect(() => parseVerifiedLemonWebhook(payload(99))).toThrow("INVALID_WEBHOOK_STORE"));
  it("quarantines unknown variants as an unmapped plan", () => expect(parseVerifiedLemonWebhook(payload(42, 9999)).planId).toBeNull());
});
