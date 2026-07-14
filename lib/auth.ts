export type ToneMode = "balanced" | "warm" | "direct" | "formal";
export type PlanId = "free" | "personal" | "work";
export const planRank: Record<PlanId, number> = { free: 0, personal: 1, work: 2 };
export const hasPlanAccess = (current: PlanId, required: PlanId) => planRank[current] >= planRank[required];

export type BillingSubscription = { status: "inactive" | "active" | "past_due" | "cancelled" | "expired"; plan: PlanId; startedAt: string; expiresAt?: string | null; autoRenew: boolean; provider: "lemon_squeezy"; orderId?: string | null; subscriptionId?: string | null };
export type BillingInvoice = { id: string; orderId: string; plan: PlanId; amount: number; currency: string; status: "paid" | "pending" | "failed" | "refunded"; createdAt: string; paidAt?: string | null; receiptUrl?: string | null };
export type AltrProfile = { id: string; name: string; email: string; role: string; altrName: string; bio: string; createdAt: string; updatedAt: string; plan: PlanId; trainingProgress: number; tone: ToneMode; stats: { conversations: number; memories: number; drafts: number }; connections: { email: boolean; calendar: boolean; messages: boolean; workspace: boolean }; preferences: { learning: boolean; autoDrafts: boolean; weeklyDigest: boolean; privacyMode: boolean }; consents: { policyVersion: string; termsAcceptedAt: string; conversationProcessingAcceptedAt: string; aiMemoryAcceptedAt: string }; subscription?: BillingSubscription | null; invoices?: BillingInvoice[] };

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...(init.headers ?? {}) } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : `REQUEST_FAILED_${response.status}`);
  return payload as T;
}

export async function getCurrentProfile(): Promise<AltrProfile | null> {
  try { return (await api<{ profile: AltrProfile | null }>("/api/me")).profile; } catch { return null; }
}

export async function registerAccount(input: { name: string; email: string; password: string; policyVersion: string; termsAccepted: true; conversationProcessingAccepted: true; aiMemoryAccepted: true; locale: string }) {
  return api<{ ok: true; requiresEmailVerification: boolean }>("/api/auth/register", { method: "POST", body: JSON.stringify(input) });
}

export async function signInAccount(email: string, password: string) {
  return api<{ ok: true }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export async function requestPasswordReset(email: string) {
  return api<{ ok: true; message: string }>("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
}

export async function resetPassword(password: string) {
  return api<{ ok: true }>("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ password, confirmPassword: password }) });
}

export async function signInWithGoogle() { window.location.href = "/api/auth/google/start"; }
export async function updateCurrentProfile(update: Partial<AltrProfile>) { return api<{ profile: AltrProfile }>("/api/me", { method: "PATCH", body: JSON.stringify(update) }).then((payload) => payload.profile); }
export async function signOutAccount() { await api<{ ok: true }>("/api/auth/logout", { method: "POST" }); }
export async function deleteCurrentAccount(confirmText = "DELETE") { await api<{ ok: true }>("/api/me", { method: "DELETE", body: JSON.stringify({ confirmText }) }); }
export function redeemPromoCode(): never { throw new Error("PROMO_CODES_DISABLED_IN_PRODUCTION"); }
export function activatePaidSubscription(): never { throw new Error("PAID_PLANS_CAN_ONLY_BE_ACTIVATED_BY_VERIFIED_LEMON_SQUEEZY_WEBHOOKS"); }
