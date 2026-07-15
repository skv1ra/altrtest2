"use client";

import { useEffect } from "react";
import { getStoredLanguage } from "@/lib/i18n/lang-store";

export function LocaleHtmlSync() {
  useEffect(() => {
    const apply = () => {
      const lang = getStoredLanguage();
      document.documentElement.lang = lang === "UA" ? "uk" : "en";
    };
    apply();
    window.addEventListener("altr-language-change", apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener("altr-language-change", apply);
      window.removeEventListener("storage", apply);
    };
  }, []);
  return null;
}
