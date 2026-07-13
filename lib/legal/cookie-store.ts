import { LANGUAGE_STORAGE_KEY, type Lang } from "@/lib/i18n/lang-store";
import { getCurrentProfile } from "@/lib/auth";
import { LEGAL_CONFIG } from "./legal-config";
import { recordConsent } from "./consent-store";

export type CookiePreferences = {
  necessary: true;
  functional: boolean;
  analytics: false;
  marketing: false;
  version: string;
  timestamp: string;
  source: "banner" | "preferences";
  userId?: