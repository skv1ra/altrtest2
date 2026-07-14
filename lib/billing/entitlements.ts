import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type PlanId = "free" | "personal" | "work";

export type UserEntitlement = {
  planId: PlanId;
  hasPremium: boolean;
  reason: string;
  accessEndsAt: string | null;
};

const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  personal: 1,
  work: 2,
};

export function hasPlanAccess(currentPlan: PlanId, requiredPlan: PlanId): boolean {
  return PLAN_RANK[currentPlan] >= PLAN_RANK[requiredPlan];
}

export async function getUserEntitlement(userId: string): Promise<UserEntitlement> {
  const { data, error } = await createSupabaseAdminClient()
    .rpc("altr_user_entitlement", { target_user_id: userId })
    .single();

  if (error) throw error;

  const planId = data?.plan_id === "work" || data?.plan_id === "personal" ? data.plan_id : "free";
  return {
    planId,
    hasPremium: Boolean(data?.has_premium),
    reason: typeof data?.reason === "string" ? data.reason : "no_subscription",
    accessEndsAt: typeof data?.access_ends_at === "string" ? data.access_ends_at : null,
  };
}

export async function requirePlan(userId: string, requiredPlan: PlanId): Promise<UserEntitlement> {
  const entitlement = await getUserEntitlement(userId);
  const allowed = requiredPlan === "free" || (entitlement.hasPremium && hasPlanAccess(entitlement.planId, requiredPlan));

  if (!allowed) {
    const error = new Error("PLAN_REQUIRED");
    Object.assign(error, { status: 403, requiredPlan, entitlement });
    throw error;
  }

  return entitlement;
}
