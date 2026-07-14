export type PlanId = "free" | "personal" | "work";

const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  personal: 1,
  work: 2,
};

export function hasPlanAccess(currentPlan: PlanId, requiredPlan: PlanId): boolean {
  return PLAN_RANK[currentPlan] >= PLAN_RANK[requiredPlan];
}
