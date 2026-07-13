import { LANGUAGE_STORAGE_KEY, type Lang } from "@/lib/i18n/lang-store";
import { LEGAL_CONFIG } from "./legal-config";

export type CookiePreferences = {
  necessary: true;
  functional: boolean;
  analytics: false;
  marketing: false;
  version: string;
  timestamp: string;
  source: "banner" | "preferences";
  userId?: string;
};

export const COOKIE_PREFERENCES_KEY = "altr_cookie_preferences_v1";

export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(COOKIE_PREFERENCES_KEY) ?? "null") as CookiePreferences | null;
    return parsed?.necessary === true ? { ...parsed, analytics: false, marketing: false } : null;
  } catch {
    return null;
  }
}

export function saveCookiePreferences(functional: boolean, source: CookiePreferences["source"], locale: Lang = "EN") {
  if (typeof window === "undefined") return null;
  const preference: CookiePreferences = {
    necessary: true,
    functional,
    analytics: false,
    marketing: false,
    version: LEGAL_CONFIG.COOKIE_POLICY_VERSION,
    timestamp: new Date().toISOString(),
    source,
  };
  window.localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preference));
  if (functional) window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
  else window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent<CookiePreferences>("altr-cookie-preferences-change", { detail: preference }));
  return preference;
}

export function openCookiePreferences() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("altr-open-cookie-preferences"));
}
