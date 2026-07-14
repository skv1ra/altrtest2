import "server-only";

import {
  createCheckout,
  getSubscription,
  getVariant,
  lemonSqueezySetup,
} from "@lemonsqueezy/lemonsqueezy.js";
import { z } from "zod";
import { knownPlanDisplay } from "@/lib/billing/plans";
import type { PaidPlanId } from "@/lib/billing/types";

const billingEnvSchema = z.object({
  LEMONSQUEEZY_API_KEY: z.string().min(20),
  LEMONSQUEEZY_STORE_ID: z.coerce.number().int().positive(),
  LEMONSQUEEZY_WEBHOOK_SECRET: z.string().min(20),
  LEMONSQUEEZY_PERSONAL_VARIANT_ID: z.coerce.number().int().positive(),
  LEMONSQUEEZY_WORK_VARIANT_ID: z.coerce.number().int().positive(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

type BillingEnv = z.infer<typeof billingEnvSchema>;
let configuredKey: string | null = null;

export function getBillingEnv(): BillingEnv {
  const result = billingEnvSchema.safeParse({
    LEMONSQUEEZY_API_KEY: process.env.LEMONSQUEEZY_API_KEY,
    LEMONSQUEEZY_STORE_ID: process.env.LEMONSQUEEZY_STORE_ID,
    LEMONSQUEEZY_WEBHOOK_SECRET: process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
    LEMONSQUEEZY_PERSONAL_VARIANT_ID: process.env.LEMONSQUEEZY_PERSONAL_VARIANT_ID,
    LEMONSQUEEZY_WORK_VARIANT_ID: process.env.LEMONSQUEEZY_WORK_VARIANT_ID,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!result.success) {
    throw new Error(`LEMONSQUEEZY_CONFIG_INVALID: ${result.error.issues.map((issue) => issue.path.join(".")).join(", ")}`);
  }
  return result.data;
}

function configureSdk() {
  const env = getBillingEnv();
  if (configuredKey !== env.LEMONSQUEEZY_API_KEY) {
    lemonSqueezySetup({ apiKey: env.LEMONSQUEEZY_API_KEY });
    configuredKey = env.LEMONSQUEEZY_API_KEY;
  }
  return env;
}

export function variantIdForPlan(planId: PaidPlanId): number {
  const env = getBillingEnv();
  return planId === "personal" ? env.LEMONSQUEEZY_PERSONAL_VARIANT_ID : env.LEMONSQUEEZY_WORK_VARIANT_ID;
}

export function planFromVariantId(value: unknown): PaidPlanId | null {
  const id = Number(value);
  if (!Number.isInteger(id)) return null;
  const env = getBillingEnv();
  if (id === env.LEMONSQUEEZY_PERSONAL_VARIANT_ID) return "personal";
  if (id === env.LEMONSQUEEZY_WORK_VARIANT_ID) return "work";
  return null;
}

export async function createHostedCheckout(input: {
  userId: string;
  email: string;
  name: string;
  planId: PaidPlanId;
}) {
  const env = configureSdk();
  const variantId = variantIdForPlan(input.planId);
  const { data, error, statusCode } = await createCheckout(env.LEMONSQUEEZY_STORE_ID, variantId, {
    checkoutData: {
      email: input.email,
      name: input.name,
      custom: { user_id: input.userId, plan_id: input.planId },
    },
    checkoutOptions: { discount: true, embed: false },
    productOptions: { redirectUrl: `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/payment/success` },
  });

  if (error || !data?.data?.attributes?.url) {
    throw new Error(`LEMONSQUEEZY_CHECKOUT_FAILED_${statusCode ?? "UNKNOWN"}`);
  }
  return { url: data.data.attributes.url, variantId };
}

export async function getFreshCustomerPortalUrl(subscriptionId: string) {
  configureSdk();
  const { data, error, statusCode } = await getSubscription(subscriptionId);
  const url = data?.data?.attributes?.urls?.customer_portal;
  if (error || typeof url !== "string" || !url.startsWith("https://")) {
    throw new Error(`LEMONSQUEEZY_PORTAL_FAILED_${statusCode ?? "UNKNOWN"}`);
  }
  return url;
}

export async function getCurrentPlanPricing() {
  configureSdk();
  return Promise.all(
    (["personal", "work"] as const).map(async (planId) => {
      const fallback = knownPlanDisplay[planId];
      try {
        const { data, error } = await getVariant(variantIdForPlan(planId));
        const attributes = data?.data?.attributes as Record<string, unknown> | undefined;
        const price = typeof attributes?.price === "number" ? attributes.price : fallback.amount;
        return { planId, amount: price, currency: fallback.currency, interval: fallback.interval, live: !error };
      } catch {
        return { planId, amount: fallback.amount, currency: fallback.currency, interval: fallback.interval, live: false };
      }
    }),
  );
}
