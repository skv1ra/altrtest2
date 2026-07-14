// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({
  createCheckout: vi.fn(),
  getSubscription: vi.fn(),
  getVariant: vi.fn(),
  lemonSqueezySetup: vi.fn(),
}));

vi.mock("@lemonsqueezy/lemonsqueezy.js", () => sdk);

import { createHostedCheckout, planFromVariantId } from "@/lib/billing/lemonsqueezy";

const requiredEnvironment = {
  NEXT_PUBLIC_APP_URL: "https://altr.example",
  LEMONSQUEEZY_API_KEY: "test-lemon-key-at-least-20-characters",
  LEMONSQUEEZY_STORE_ID: "42",
  LEMONSQUEEZY_WEBHOOK_SECRET: "test-webhook-secret-at-least-20-characters",
  LEMONSQUEEZY_PERSONAL_VARIANT_ID: "1001",
  LEMONSQUEEZY_WORK_VARIANT_ID: "1002",
};

describe("Lemon Squeezy SDK boundary", () => {
  beforeEach(() => {
    for (const [name, value] of Object.entries(requiredEnvironment)) vi.stubEnv(name, value);
    sdk.createCheckout.mockReset();
    sdk.lemonSqueezySetup.mockReset();
  });

  afterEach(() => vi.unstubAllEnvs());

  it("maps only configured variant IDs", () => {
    expect(planFromVariantId("1001")).toBe("personal");
    expect(planFromVariantId(1002)).toBe("work");
    expect(planFromVariantId("9999")).toBeNull();
  });

  it("creates hosted checkout with authenticated metadata", async () => {
    sdk.createCheckout.mockResolvedValue({
      data: { data: { attributes: { url: "https://checkout.lemonsqueezy.com/buy/example" } } },
      error: null,
      statusCode: 201,
    });

    const checkout = await createHostedCheckout({
      userId: "00000000-0000-4000-8000-000000000001",
      email: "user@example.com",
      name: "Example User",
      planId: "personal",
    });

    expect(checkout).toEqual({ url: "https://checkout.lemonsqueezy.com/buy/example", variantId: 1001 });
    expect(sdk.lemonSqueezySetup).toHaveBeenCalledWith({ apiKey: requiredEnvironment.LEMONSQUEEZY_API_KEY });
    expect(sdk.createCheckout).toHaveBeenCalledWith(42, 1001, {
      checkoutData: {
        email: "user@example.com",
        name: "Example User",
        custom: { user_id: "00000000-0000-4000-8000-000000000001", plan_id: "personal" },
      },
      checkoutOptions: { discount: true, embed: false },
      productOptions: { redirectUrl: "https://altr.example/payment/success" },
    });
  });
});
