"use client";

import { openCookiePreferences } from "@/lib/legal/cookie-store";

export function CookiePreferencesButton({ children = "Cookie Preferences", className = "" }: { children?: React.ReactNode; className?: string }) {
  return <button type="button" onClick={openCookiePreferences} className={className}>{children}</button>;
}
