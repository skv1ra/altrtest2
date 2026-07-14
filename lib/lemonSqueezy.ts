import { createHmac, timingSafeEqual } from "crypto";
import { getAppUrl, getPlanVariantId, getServerEnv } from "@/lib/env";
import type { PlanId } from "@/lib/auth";

export type PaidPlanId = Exclude<PlanId, "free">;

const variantPlanMap = new Map<string, PaidPlanId>();

function rebuildVariantMap() {
  variantPlanMap.clear();
  variantPlanMap.set(getPlanVariantId("personal"), "personal");
  variantPlanMap.set(getPlanVariantId("work"), "work");
}

export function planFromVariantId(variantId: string | number | null | undefined): PaidPlanId | null {
  if (variantPlanMap.size === 0) rebuildVariantMap();
  return variantPlanMap.get(String(variantId ?? "")) ?? null;
}

export async function createCheckout(input: { userId: string; email: string; plan: PaidPlanId }) {
  const env = getServerEnv();
  const variantId = getPlanVariantId(input.plan);
  const appUrl = getAppUrl();

  const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${env.LEMONSQUEEZY_API_KEY}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: input.email,
            custom: {
              supabase_user_id: input.userId,
              altr_plan: input.plan,
            },
          },
          product_options: {
            redirect_url: `${appUrl}/billing/return`,
          },
          checkout_options: {
            discount: true,
          },
        },
        relationships: {
          store: { data: { type: "stores", id: env.LEMONSQUEEZY_STORE_ID } },
          variant: { data: { type: "variants", id: variantId } },
        },
      },
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`LEMON_CHECKOUT_FAILED_${response.status}: ${JSON.stringify(payload)}`);
  }

  const url = payload?.data?.attributes?.url;
  if (typeof url !== "string" || !url.startsWith("https://")) {
    throw new Error("LEMON_CHECKOUT_URL_MISSING");
  }

  return { url, variantId };
}

export async function verifyWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const secret = getServerEnv().LEMONSQUEEZY_WEBHOOK_SECRET;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const left = Buffer.from(signature, "hex");
  const right = Buffer.from(expected, "hex");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
