import type { PlanId } from "@/lib/auth";

export type BillingInvoice = {
  id: string;
  orderId: string;
  plan: PlanId;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed" | "refunded";
  createdAt: string;
  paidAt?: string | null;
  receiptUrl?: string | null;
};

export type PendingPayment = never;

export function savePendingPayment(): never {
  throw new Error("Client-side pending payments are disabled. Use /api/billing/checkout and verified Lemon Squeezy webhooks.");
}

export function getPendingPayment(): null {
  return null;
}

export function clearPendingPayment() {
  return undefined;
}
