export type ToneMode = "balanced" | "warm" | "direct" | "formal";
export type PlanId = "free" | "personal" | "work";

export const planRank: Record<PlanId, number> = { free: 0, personal: 1, work: 2 };
export const hasPlanAccess = (current: PlanId, required: PlanId) => planRank[current] >= planRank[required];
export const isSubscriptionActive = (profile: AltrProfile | null) => Boolean(profile?.subscription?.status === "active" && new Date(profile.subscription.expiresAt).getTime() > Date.now());

export type BillingSubscription = {
  status: "inactive" | "active" | "past_due" | "cancelled";
  plan: PlanId;
  startedAt: string;
  expiresAt: string;
  autoRenew: boolean;
  provider: "liqpay" | "promo" | "manual";
  orderId?: string;
  subscriptionId?: string;
};

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

export type AltrProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  altrName: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
  plan: PlanId;
  trainingProgress: number;
  tone: ToneMode;
  stats: {
    conversations: number;
    memories: number;
    drafts: number;
  };
  connections: {
    email: boolean;
    calendar: boolean;
    messages: boolean;
    workspace: boolean;
  };
  preferences: {
    learning: boolean;
    autoDrafts: boolean;
    weeklyDigest: boolean;
    privacyMode: boolean;
  };
  consents: {
    policyVersion: string;
    termsAcceptedAt: string;
    conversationProcessingAcceptedAt: string;
    aiMemoryAcceptedAt: string;
  };
  promo?: {
    code: string;
    previousPlan: PlanId;
    grantedPlan: PlanId;
    redeemedAt: string;
    expiresAt: string;
  };
  redeemedPromoCodes?: string[];
  subscription?: BillingSubscription;
  invoices?: BillingInvoice[];
};

type StoredAccount = {
  profile: AltrProfile;
  passwordHash: string;
};

const ACCOUNTS_KEY = "altr_accounts_v1";
const SESSION_KEY = "altr_session_v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAccounts(): StoredAccount[] {
  if (!canUseStorage()) return [];

  try {
    const value = window.localStorage.getItem(ACCOUNTS_KEY);
    return value ? (JSON.parse(value) as StoredAccount[]) : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(`altr-local-demo:${password}`);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function createId() {
  return window.crypto.randomUUID?.() ?? `altr-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getCurrentProfile(): AltrProfile | null {
  if (!canUseStorage()) return null;
  const sessionId = window.localStorage.getItem(SESSION_KEY);
  if (!sessionId) return null;
  const accounts = readAccounts();
  const index = accounts.findIndex((account) => account.profile.id === sessionId);
  if (index < 0) return null;

  const stored = accounts[index].profile;
  if (stored.promo && new Date(stored.promo.expiresAt).getTime() <= Date.now()) {
    const profile: AltrProfile = { ...stored, plan: stored.promo.previousPlan, promo: undefined };
    accounts[index] = { ...accounts[index], profile };
    writeAccounts(accounts);
    return profile;
  }
  if (stored.subscription && stored.subscription.status === "active" && new Date(stored.subscription.expiresAt).getTime() <= Date.now()) {
    const profile: AltrProfile = { ...stored, plan: "free", subscription: { ...stored.subscription, status: "past_due" } };
    accounts[index] = { ...accounts[index], profile };
    writeAccounts(accounts);
    return profile;
  }

  if (!("plan" in stored) || !("workspace" in stored.connections) || !("consents" in stored)) {
    const profile: AltrProfile = {
      ...stored,
      plan: (stored as AltrProfile).plan ?? "free",
      connections: {
        email: stored.connections.email ?? false,
        calendar: stored.connections.calendar ?? false,
        messages: stored.connections.messages ?? false,
        workspace: stored.connections.workspace ?? false,
      },
      preferences: { ...stored.preferences, autoDrafts: false, weeklyDigest: false },
      consents: (stored as AltrProfile).consents ?? { policyVersion: "", termsAcceptedAt: "", conversationProcessingAcceptedAt: "", aiMemoryAcceptedAt: "" },
      invoices: (stored as AltrProfile).invoices ?? [],
    };
    accounts[index] = { ...accounts[index], profile };
    writeAccounts(accounts);
    return profile;
  }

  return stored;
}

export async function registerAccount(input: { name: string; email: string; password: string; policyVersion: string }) {
  const accounts = readAccounts();
  const email = input.email.trim().toLowerCase();

  if (accounts.some((account) => account.profile.email.toLowerCase() === email)) {
    throw new Error("ACCOUNT_EXISTS");
  }

  const now = new Date().toISOString();
  const id = createId();
  const profile: AltrProfile = {
    id,
    name: input.name.trim(),
    email,
    role: "Founder",
    altrName: `${input.name.trim().split(" ")[0] || "My"} Altr`,
    bio: "Altr вивчає мій стиль спілкування, рішення та робочий контекст.",
    createdAt: now,
    updatedAt: now,
    plan: "free",
    trainingProgress: 18,
    tone: "balanced",
    stats: { conversations: 0, memories: 3, drafts: 0 },
    connections: { email: false, calendar: false, messages: false, workspace: false },
    preferences: { learning: true, autoDrafts: false, weeklyDigest: false, privacyMode: true },
    consents: { policyVersion: input.policyVersion, termsAcceptedAt: now, conversationProcessingAcceptedAt: now, aiMemoryAcceptedAt: now },
    redeemedPromoCodes: [],
    invoices: [],
  };

  accounts.push({ profile, passwordHash: await hashPassword(input.password) });
  writeAccounts(accounts);
  window.localStorage.setItem(SESSION_KEY, id);
  window.dispatchEvent(new Event("altr-auth-change"));
  return profile;
}

export async function signInAccount(emailInput: string, password: string) {
  const email = emailInput.trim().toLowerCase();
  const passwordHash = await hashPassword(password);
  const account = readAccounts().find(
    (item) => item.profile.email.toLowerCase() === email && item.passwordHash === passwordHash,
  );

  if (!account) throw new Error("INVALID_CREDENTIALS");
  window.localStorage.setItem(SESSION_KEY, account.profile.id);
  window.dispatchEvent(new Event("altr-auth-change"));
  return account.profile;
}

export function updateCurrentProfile(update: Partial<AltrProfile>) {
  const current = getCurrentProfile();
  if (!current) return null;

  const accounts = readAccounts();
  const index = accounts.findIndex((account) => account.profile.id === current.id);
  if (index < 0) return null;

  const profile: AltrProfile = {
    ...accounts[index].profile,
    ...update,
    stats: update.stats ?? accounts[index].profile.stats,
    connections: update.connections ?? accounts[index].profile.connections,
    preferences: update.preferences ?? accounts[index].profile.preferences,
    subscription: update.subscription ?? accounts[index].profile.subscription,
    invoices: update.invoices ?? accounts[index].profile.invoices,
    updatedAt: new Date().toISOString(),
  };

  accounts[index] = { ...accounts[index], profile };
  writeAccounts(accounts);
  window.dispatchEvent(new Event("altr-profile-change"));
  return profile;
}

export function redeemPromoCode(codeInput: string) {
  const profile = getCurrentProfile();
  if (!profile) throw new Error("NOT_SIGNED_IN");
  const code = codeInput.trim().toLowerCase();
  if (code !== "test1") throw new Error("INVALID_PROMO");
  if (profile.redeemedPromoCodes?.includes(code)) throw new Error("PROMO_USED");
  const redeemedAt = new Date();
  const expiresAt = new Date(redeemedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  return updateCurrentProfile({
    plan: "work",
    promo: { code, previousPlan: profile.plan, grantedPlan: "work", redeemedAt: redeemedAt.toISOString(), expiresAt: expiresAt.toISOString() },
    redeemedPromoCodes: [...(profile.redeemedPromoCodes ?? []), code],
  });
}

export function signOutAccount() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("altr-auth-change"));
}

export function deleteCurrentAccount() {
  const current = getCurrentProfile();
  if (!current) return;
  writeAccounts(readAccounts().filter((account) => account.profile.id !== current.id));
  try {
    const imports = JSON.parse(window.localStorage.getItem("altr_conversation_imports_v1") ?? "[]") as { userId?: string }[];
    window.localStorage.setItem("altr_conversation_imports_v1", JSON.stringify(imports.filter(record => record.userId !== current.id)));
  } catch { window.localStorage.removeItem("altr_conversation_imports_v1"); }
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("altr-auth-change"));
}


export function activatePaidSubscription(input: { plan: PlanId; orderId: string; amount: number; currency: string; autoRenew?: boolean }) {
  const profile = getCurrentProfile();
  if (!profile) return null;
  if (input.plan === "free") return updateCurrentProfile({ plan: "free", subscription: undefined });

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const invoices = profile.invoices ?? [];
  const invoiceExists = invoices.some((invoice) => invoice.orderId === input.orderId);

  return updateCurrentProfile({
    plan: input.plan,
    subscription: {
      status: "active",
      plan: input.plan,
      startedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      autoRenew: input.autoRenew ?? true,
      provider: "liqpay",
      orderId: input.orderId,
    },
    invoices: invoiceExists ? invoices : [{
      id: `inv_${input.orderId}`,
      orderId: input.orderId,
      plan: input.plan,
      amount: input.amount,
      currency: input.currency,
      status: "paid",
      createdAt: now.toISOString(),
      paidAt: now.toISOString(),
      receiptUrl: `/payment/receipt/${input.orderId}`,
    }, ...invoices],
  });
}
