import { z } from "zod";
import type { PaidPlanId } from "@/lib/billing/types";

export const checkoutInputSchema = z.object({ planId: z.enum(["personal", "work"]) }).strict();

export function parseCheckoutInput(value: unknown): { planId: PaidPlanId } {
  return checkoutInputSchema.parse(value);
}
