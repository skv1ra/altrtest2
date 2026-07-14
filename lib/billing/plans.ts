import type { PaidPlanId, PlanId } from "@/lib/billing/types";

const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  personal: 1,
  work: 2,
};

export const paidPlanIds = ["personal", "work"] as const satisfies readonly PaidPlanId[];

export const knownPlanDisplay = {
  free: { name: "Безкоштовна", amount: 0, currency: "USD", interval: null },
  personal: { name: "Особиста", amount: 2000, currency: "USD", interval: "month" },
  work: { name: "Робоча", amount: 4000, currency: "USD", interval: "month" },
} as const;

export function isPaidPlanId(value: unknown): value is PaidPlanId {
  return typeof value === "string" && paidPlanIds.includes(value as PaidPlanId);
}

export function hasPlanAccess(currentPlan: PlanId, requiredPlan: PlanId): boolean {
  return PLAN_RANK[currentPlan] >= PLAN_RANK[requiredPlan];
}

export type { PaidPlanId, PlanId } from "@/lib/billing/types";
