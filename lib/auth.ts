export type ToneMode = "balanced" | "warm" | "direct" | "formal";

export type AltrProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  altrName: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
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
  };
  preferences: {
    learning: boolean;
    autoDrafts: boolean;
    weeklyDigest: boolean;
    privacyMode: boolean;
  };
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
  return readAccounts().find((account) => account.profile.id === sessionId)?.profile ?? null;
}

export async function registerAccount(input: { name: string; email: string; password: string }) {
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
    trainingProgress: 18,
    tone: "balanced",
    stats: { conversations: 0, memories: 3, drafts: 0 },
    connections: { email: false, calendar: false, messages: false },
    preferences: { learning: true, autoDrafts: true, weeklyDigest: true, privacyMode: true },
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
    updatedAt: new Date().toISOString(),
  };

  accounts[index] = { ...accounts[index], profile };
  writeAccounts(accounts);
  window.dispatchEvent(new Event("altr-profile-change"));
  return profile;
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
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("altr-auth-change"));
}
