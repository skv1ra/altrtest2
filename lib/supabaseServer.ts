import type { PlanId } from "@/lib/auth";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type DbPayment = {
  order_id: string;
  email?: string | null;
  plan: Exclude<PlanId, "free">;
  amount: number;
  currency: string;
  status: string;
  auto_renew: boolean;
  provider?: string;
  provider_subscription_id?: string | null;
  raw_payload?: JsonValue;
  created_at?: string;
  paid_at?: string | null;
};

export type DbSubscription = {
  email: string;
  plan: PlanId;
  status: "inactive" | "active" | "past_due" | "cancelled";
  started_at: string;
  expires_at: string;
  auto_renew: boolean;
  provider: "liqpay" | "promo" | "manual";
  order_id?: string | null;
  provider_subscription_id?: string | null;
  updated_at?: string;
};

export type DbInvoice = {
  order_id: string;
  email?: string | null;
  plan: Exclude<PlanId, "free">;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  receipt_url?: string | null;
  created_at?: string;
  paid_at?: string | null;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, key, configured: Boolean(url && key) };
}

export function isSupabaseConfigured() {
  return getSupabaseConfig().configured;
}

async function supabaseFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url, key, configured } = getSupabaseConfig();
  if (!configured || !url || !key) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }

  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`SUPABASE_ERROR_${response.status}: ${errorText}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function upsertProfile(email?: string | null, name?: string | null) {
  if (!email) return null;
  const normalizedEmail = email.trim().toLowerCase();
  const rows = await supabaseFetch<{ id: string; email: string }[]>("altr_profiles?on_conflict=email", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify([{ email: normalizedEmail, name: name ?? null, updated_at: new Date().toISOString() }]),
  });
  return rows[0] ?? null;
}

export async function createPendingPayment(payment: DbPayment) {
  const rows = await supabaseFetch<DbPayment[]>("altr_payments?on_conflict=order_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify([{ ...payment, email: payment.email?.trim().toLowerCase() ?? null }]),
  });
  return rows[0] ?? null;
}

export async function markPaymentFromCallback(input: DbPayment) {
  const rows = await supabaseFetch<DbPayment[]>("altr_payments?on_conflict=order_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify([{ ...input, email: input.email?.trim().toLowerCase() ?? null }]),
  });
  return rows[0] ?? null;
}

export async function upsertSubscription(subscription: DbSubscription) {
  const rows = await supabaseFetch<DbSubscription[]>("altr_subscriptions?on_conflict=order_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify([{ ...subscription, email: subscription.email.trim().toLowerCase(), updated_at: new Date().toISOString() }]),
  });
  return rows[0] ?? null;
}

export async function upsertInvoice(invoice: DbInvoice) {
  const rows = await supabaseFetch<DbInvoice[]>("altr_invoices?on_conflict=order_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify([{ ...invoice, email: invoice.email?.trim().toLowerCase() ?? null }]),
  });
  return rows[0] ?? null;
}

export async function getActiveSubscription(input: { email?: string | null; orderId?: string | null }) {
  if (input.orderId) {
    const rows = await supabaseFetch<DbSubscription[]>(`altr_subscriptions?order_id=eq.${encodeURIComponent(input.orderId)}&order=updated_at.desc&limit=1`);
    return rows[0] ?? null;
  }
  if (input.email) {
    const email = input.email.trim().toLowerCase();
    const rows = await supabaseFetch<DbSubscription[]>(`altr_subscriptions?email=eq.${encodeURIComponent(email)}&status=eq.active&order=updated_at.desc&limit=1`);
    return rows[0] ?? null;
  }
  return null;
}

export async function getInvoiceByOrderId(orderId: string) {
  const rows = await supabaseFetch<DbInvoice[]>(`altr_invoices?order_id=eq.${encodeURIComponent(orderId)}&limit=1`);
  return rows[0] ?? null;
}

export async function getPaymentByOrderId(orderId: string) {
  const rows = await supabaseFetch<DbPayment[]>(`altr_payments?order_id=eq.${encodeURIComponent(orderId)}&limit=1`);
  return rows[0] ?? null;
}
