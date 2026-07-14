// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCheckout, planFromVariantId } from "@/lib/lemonSqueezy";

const requiredEnvironment = {
  NEXT_PUBLIC_APP_URL: "https://altr.example",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key-at-least-20-characters",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key-at-least-20-characters",
  LEMONSQUEEZY_API_KEY: "test-lemon-key-at-least-20-characters",
  LEMONSQUEEZY_STORE_ID: "42",
  LEMONSQUEEZY_WEBHOOK_SECRET: "test-webhook-secret-at-least-20-characters",
  LEMONSQUEEZY_PERSONAL_VARIANT_ID: "1001",
  LEMONSQUEEZY_WORK_VARIANT_ID: "1002",
};

describe("Lemon Squeezy integration boundary", () => {
  beforeEach(() => {
    for (const [name, value] of Object.entries(requiredEnvironment)) {
      vi.stubEnv(name, value);
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("maps configured variant IDs without an external request", () => {
    expect(planFromVariantId("1001")).toBe("personal");
    expect(planFromVariantId(1002)).toBe("work");
    expect(planFromVariantId("9999")).toBeNull();
  });

  it("uses a mocked API and sends authenticated user metadata", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            attributes: {
              url: "https://checkout.lemonsqueezy.com/buy/example",
            },
          },
        }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const checkout = await createCheckout({
      userId: "00000000-0000-4000-8000-000000000001",
      email: "user@example.com",
      plan: "personal",
    });

    expect(checkout).toEqual({
      url: "https://checkout.lemonsqueezy.com/buy/example",
      variantId: "1001",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.lemonsqueezy.com/v1/checkouts");
    expect(request.headers).toMatchObject({
      Authorization: "Bearer test-lemon-key-at-least-20-characters",
    });

    const body = JSON.parse(String(request.body));
    expect(body.data.attributes.checkout_data.custom).toEqual({
      supabase_user_id: "00000000-0000-4000-8000-000000000001",
      altr_plan: "personal",
    });
    expect(body.data.attributes.product_options.redirect_url).toBe("https://altr.example/billing/return");
    expect(body.data.attributes.checkout_options.discount).toBe(true);
  });
});
