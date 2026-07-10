import type { Lang } from "@/lib/i18n/lang-store";
import { LEGAL_CONFIG } from "./legal-config";

export type ConsentType =
  | "terms"
  | "privacy_acknowledgement"
  | "conversation_processing"
  | "ai_memory"
  | "analytics_cookies"
  | "functional_cookies"
  | "marketing_cookies";

export type ConsentSource = "registration" | "settings" | "feature-gate" | "cookie-banner" | "cookie-preferences" | "migration";

export type ConsentRecord = {
  id: string;
  userId: string;
  consentType: ConsentType;
  granted: boolean;
  policyVersion: string;
  consentTextVersion: string;
  timestamp: string;
  source: ConsentSource;
  locale: Lang;
  userAgent?: string;
  withdrawnAt?: string;
  metadata?: Record<string, string | number | boolean>;
};

export const CONSENT_STORAGE_KEY = "altr_consent_records_v1";

const versions: Record<ConsentType, string> = {
  terms: LEGAL_CONFIG.TERMS_VERSION,
  privacy_acknowledgement: LEGAL_CONFIG.PRIVACY_POLICY_VERSION,
  conversation_processing: LEGAL_CONFIG.PRIVACY_POLICY_VERSION,
  ai_memory: LEGAL_CONFIG.PRIVACY_POLICY_VERSION,
  analytics_cookies: LEGAL_CONFIG.COOKIE_POLICY_VERSION,
  functional_cookies: LEGAL_CONFIG.COOKIE_POLICY_VERSION,
  marketing_cookies: LEGAL_CONFIG.COOKIE_POLICY_VERSION,
};

function canUseStorage() { return typeof window !== "undefined" && Boolean(window.localStorage); }
function createId() { return window.crypto.randomUUID?.() ?? `consent-${Date.now()}-${Math.random().toString(16).slice(2)}`; }

function readRecords(): ConsentRecord[] {
  if (!canUseStorage()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? "[]") as ConsentRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function writeRecords(records: ConsentRecord[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event("altr-consent-change"));
}

export function getConsentVersion(type: ConsentType) { return versions[type]; }

export function recordConsent(input: {
  userId: string;
  consentType: ConsentType;
  granted: boolean;
  source: ConsentSource;
  locale: Lang;
  metadata?: ConsentRecord["metadata"];
}) {
  if (!canUseStorage()) return null;
  const now = new Date().toISOString();
  const record: ConsentRecord = {
    id: createId(),
    userId: input.userId,
    consentType: input.consentType,
    granted: input.granted,
    policyVersion: versions[input.consentType],
    consentTextVersion: versions[input.consentType],
    timestamp: now,
    source: input.source,
    locale: input.locale,
    userAgent: typeof navigator === "undefined" ? undefined : navigator.userAgent.slice(0, 320),
    withdrawnAt: input.granted ? undefined : now,
    metadata: input.metadata,
  };
  writeRecords([...readRecords(), record]);
  return record;
}

export function withdrawConsent(input: { userId: string; consentType: ConsentType; source?: ConsentSource; locale?: Lang }) {
  return recordConsent({ userId: input.userId, consentType: input.consentType, granted: false, source: input.source ?? "settings", locale: input.locale ?? "UA" });
}

export function getConsentRecords(userId?: string) {
  const records = readRecords();
  return userId ? records.filter((record) => record.userId === userId) : records;
}

export function getCurrentConsent(userId: string, consentType: ConsentType) {
  return getConsentRecords(userId)
    .filter((record) => record.consentType === consentType)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0] ?? null;
}

export function hasValidConsent(userId: string, consentType: ConsentType) {
  const current = getCurrentConsent(userId, consentType);
  return Boolean(current?.granted && current.policyVersion === versions[consentType]);
}

export function clearConsentRecordsForUser(userId: string) {
  writeRecords(readRecords().filter((record) => record.userId !== userId));
}
