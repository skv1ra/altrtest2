import type { LemonSubscriptionStatus, PlanId } from "@/lib/billing/types";

export type SubscriptionEntitlementInput = {
  planId: PlanId;
  status: LemonSubscriptionStatus | null;
  endsAt?: string | null;
  pastDueGraceEndsAt?: string | null;
  renewsAt?: string | null;
  trialEndsAt?: string | null;
};

export type SubscriptionEntitlement = {
  planId: PlanId;
  hasPremium: boolean;
  reason: string;
  accessEndsAt: string | null;
};

function after(value: string | null | undefined, now: Date) {
  return Boolean(value && new Date(value).valueOf() > now.valueOf());
}

export function resolveSubscriptionEntitlement(
  input: SubscriptionEntitlementInput,
  now = new Date(),
): SubscriptionEntitlement {
  const status = input.status;
  if (!status) return { planId: "free", hasPremium: false, reason: "no_subscription", accessEndsAt: null };
  if (status === "on_trial") return { planId: input.planId, hasPremium: true, reason: "on_trial", accessEndsAt: input.trialEndsAt ?? null };
  if (status === "active") return { planId: input.planId, hasPremium: true, reason: "active", accessEndsAt: input.renewsAt ?? null };
  if (status === "cancelled" && after(input.endsAt, now)) {
    return { planId: input.planId, hasPremium: true, reason: "cancelled_until_end", accessEndsAt: input.endsAt ?? null };
  }
  if (status === "past_due" && after(input.pastDueGraceEndsAt, now)) {
    return { planId: input.planId, hasPremium: true, reason: "past_due_grace", accessEndsAt: input.pastDueGraceEndsAt ?? null };
  }
  return {
    planId: "free",
    hasPremium: false,
    reason: status,
    accessEndsAt: status === "cancelled" ? input.endsAt ?? null : status === "past_due" ? input.pastDueGraceEndsAt ?? null : null,
  };
}
