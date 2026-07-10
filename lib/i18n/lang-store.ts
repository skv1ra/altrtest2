"use client";

import { useEffect, useState } from "react";

export type Lang = "EN" | "UA";
export const LANGUAGE_STORAGE_KEY = "altr_language_v1";
const COOKIE_PREFERENCES_KEY = "altr_cookie_preferences_v1";

function functionalStorageAllowed() {
  if (typeof window === "undefined") return false;
  try {
    const preference = JSON.parse(window.localStorage.getItem(COOKIE_PREFERENCES_KEY) ?? "null") as { functional?: boolean } | null;
    return preference?.functional === true;
  } catch {
    return false;
  }
}

export function getStoredLanguage(): Lang {
  if (typeof window === "undefined" || !functionalStorageAllowed()) return "EN";
  return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === "UA" ? "UA" : "EN";
}

export function setStoredLanguage(lang: Lang) {
  if (typeof window === "undefined") return;
  if (functionalStorageAllowed()) window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  else window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  document.documentElement.lang = lang === "UA" ? "uk" : "en";
  window.dispatchEvent(new CustomEvent<Lang>("altr-language-change", { detail: lang }));
}

export function useLang(initial: Lang = "EN") {
  const [lang, setLangState] = useState<Lang>(initial);

  useEffect(() => {
    const stored = getStoredLanguage();
    setLangState(stored);
    document.documentElement.lang = stored === "UA" ? "uk" : "en";
    const sync = (event: Event) => {
      const next = (event as CustomEvent<Lang>).detail ?? getStoredLanguage();
      setLangState(next);
      document.documentElement.lang = next === "UA" ? "uk" : "en";
    };
    window.addEventListener("altr-language-change", sync);
    return () => window.removeEventListener("altr-language-change", sync);
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    setStoredLanguage(next);
  };

  return [lang, setLang] as const;
}
