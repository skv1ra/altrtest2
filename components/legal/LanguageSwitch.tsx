"use client";

import type { Lang } from "@/lib/i18n/lang-store";
import { setStoredLanguage } from "@/lib/i18n/lang-store";

export function LanguageSwitch({ lang, onChange }: { lang: Lang; onChange: (lang: Lang) => void }) {
  const choose = (next: Lang) => { onChange(next); setStoredLanguage(next); };
  return (
    <div className="flex items-center gap-2 text-xs tracking-[.1em]" aria-label="Language">
      <button type="button" onClick={() => choose("EN")} aria-pressed={lang === "EN"} className={lang === "EN" ? "text-cyan-100" : "text-white/34 transition hover:text-white"}>EN</button>
      <span className="text-white/15">/</span>
      <button type="button" onClick={() => choose("UA")} aria-pressed={lang === "UA"} className={lang === "UA" ? "text-cyan-100" : "text-white/34 transition hover:text-white"}>UA</button>
    </div>
  );
}
