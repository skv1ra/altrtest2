"use client";

import { usePathname } from "next/navigation";
import { useLang, type Lang } from "@/lib/i18n/lang-store";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const [lang, setLang] = useLang("EN");

  return (
    <div className={`flex items-center gap-2 ${className}`} aria-label={lang === "UA" ? "Мова" : "Language"}>
      {(["EN", "UA"] as Lang[]).map((code) => (
        <button
          type="button"
          key={code}
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
          className={lang === code ? "language-link text-cyan-100" : "language-link text-white/50"}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

export function GlobalLanguageSwitcher() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <div className="fixed bottom-5 right-5 z-[90] rounded-full border border-white/[0.08] bg-[#07101a]/85 px-4 py-3 shadow-[0_14px_45px_rgba(0,0,0,.35)] backdrop-blur-xl">
      <LanguageSwitcher />
    </div>
  );
}
