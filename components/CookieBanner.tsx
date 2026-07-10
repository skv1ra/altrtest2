"use client";

import { Cookie, Settings2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "altr_cookie_consent_v1";
type Choice = "necessary" | "all";

export function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);

  useEffect(() => {
    setOpen(!localStorage.getItem(KEY));
    const reset = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest("[data-cookie-reset]")) { localStorage.removeItem(KEY); setSettings(true); setOpen(true); }
    };
    document.addEventListener("click", reset);
    return () => document.removeEventListener("click", reset);
  }, []);

  const save = (choice: Choice) => {
    localStorage.setItem(KEY, JSON.stringify({ choice, analytics: choice === "all", marketing: false, updatedAt: new Date().toISOString() }));
    window.dispatchEvent(new Event("altr-cookie-consent"));
    setOpen(false);
    setSettings(false);
  };

  if (!open) return null;
  return <aside className="cookie-banner" role="dialog" aria-modal="true" aria-label="Налаштування cookie">
    <div className="flex items-start gap-4"><span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-cyan-100/[.1] bg-cyan-200/[.04]"><Cookie className="h-5 w-5 text-cyan-100/60" /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-medium">Ваші дані — ваш вибір</h2><p className="mt-2 text-sm leading-6 text-white/40">Altr використовує необхідне локальне сховище для входу, профілю та безпеки. Необовʼязкові технології активуються лише за вашою згодою.</p></div><button onClick={() => save("necessary")} aria-label="Закрити та залишити необхідні" className="text-white/30 transition hover:text-white"><X className="h-5 w-5" /></button></div>
      {settings && <div className="mt-5 space-y-3 rounded-[1rem] border border-white/[.06] bg-black/15 p-4"><div className="flex items-center justify-between"><div><p className="text-sm">Необхідні</p><p className="mt-1 text-xs text-white/28">Акаунт, сесія, безпека та вибір cookie.</p></div><span className="text-[10px] uppercase tracking-[.15em] text-cyan-100/50">Завжди</span></div><div className="flex items-center justify-between border-t border-white/[.06] pt-3"><div><p className="text-sm">Аналітичні</p><p className="mt-1 text-xs text-white/28">Наразі не підключені.</p></div><span className="text-[10px] uppercase tracking-[.15em] text-white/25">Неактивні</span></div></div>}
      <div className="mt-5 flex flex-wrap items-center gap-3"><button onClick={() => save("all")} className="future-button rounded-full px-5 py-2.5 text-xs">Прийняти всі</button><button onClick={() => save("necessary")} className="glass-button rounded-full px-5 py-2.5 text-xs">Лише необхідні</button><button onClick={() => setSettings(v=>!v)} className="inline-flex items-center gap-2 px-2 text-xs text-white/38 transition hover:text-white"><Settings2 className="h-3.5 w-3.5" />Налаштувати</button><Link href="/cookies" className="ml-auto text-xs text-cyan-100/45 hover:text-cyan-50">Cookie Policy</Link></div>
    </div></div>
  </aside>;
}
