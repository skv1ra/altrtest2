import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasPlanAccess, type PlanId } from "@/lib/billing/plans";

export type UserEntitlement = {
  planId: PlanId;
  hasPremium: boolean;
  reason: string;
  accessEndsAt: string | null;
};

type EntitlementRow = {
  plan_id: string | null;
  has_premium: boolean | null;
  reason: string | null;
  access_ends_at: string | null;
};

export async function getUserEntitlement(userId: string): Promise<UserEntitlement> {
  const { data, error } = await createSupabaseAdminClient()
    .rpc("altr_user_entitlement", { target_user_id: userId })
    .single();

  if (error) throw error;

  const row = (data ?? null) as EntitlementRow | null;
  const planId = row?.plan_id === "work" || row?.plan_id === "personal" ? row.plan_id : "free";
  return {
    planId,
    hasPremium: Boolean(row?.has_premium),
    reason: typeof row?.reason === "string" ? row.reason : "no_subscription",
    accessEndsAt: typeof row?.access_ends_at === "string" ? row.access_ends_at : null,
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

export { hasPlanAccess } from "@/lib/billing/plans";
export type { PlanId } from "@/lib/billing/plans";
