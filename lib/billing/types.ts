export type PlanId = "free" | "personal" | "work";
export type PaidPlanId = Exclude<PlanId, "free">;

export type LemonSubscriptionStatus =
  | "on_trial"
  | "active"
  | "paused"
  | "past_due"
  | "unpaid"
  | "cancelled"
  | "expired";

export type BillingInvoiceSummary = {
  id: string;
  orderId: string | null;
  status: string;
  amount: number;
  currency: string;
  receiptUrl: string | null;
  issuedAt: string | null;
  paidAt: string | null;
};

export type CurrentBillingState = {
  effectivePlan: PlanId;
  hasPremium: boolean;
  entitlementReason: string;
  subscriptionStatus: LemonSubscriptionStatus | null;
  renewsAt: string | null;
  endsAt: string | null;
  trialEndsAt: string | null;
  testMode: boolean;
  canManageSubscription: boolean;
  invoices: BillingInvoiceSummary[];
};
