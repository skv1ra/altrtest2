import type { PlanId } from "@/lib/auth";

export type BillingInvoice = {
  id: string;
  orderId: string;
  plan: PlanId;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  createdAt: string;
  paidAt?: string;
  receiptUrl?: string;
};

export type PendingPayment = {
  orderId: string;
  plan: PlanId;
  amount: number;
  currency: string;
  email?: string;
  autoRenew: boolean;
  createdAt: string;
};

const PENDING_KEY = "altr_pending_payment_v1";

export function savePendingPayment(payment: PendingPayment) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PENDING_KEY, JSON.stringify(payment));
}

export function getPendingPayment(orderId?: string): PendingPayment | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(PENDING_KEY);
    if (!value) return null;
    const payment = JSON.parse(value) as PendingPayment;
    if (orderId && payment.orderId !== orderId) return null;
    return payment;
  } catch {
    return null;
  }
}

export function clearPendingPayment() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PENDING_KEY);
}
