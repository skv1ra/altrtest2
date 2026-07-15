"use client";

import { Cookie, Settings2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getCookiePreferences, saveCookiePreferences } from "@/lib/legal/cookie-store";

export function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setOpen(!getCookiePreferences());
    const show = () => { previousFocus.current = document.activeElement as HTMLElement; setSettings(true); setOpen(true); };
    window.addEventListener("altr-open-cookie-preferences", show);
    return () => window.removeEventListener("altr-open-cookie-preferences", show);
  }, []);

  useEffect(() => {
    if (!open) return;
    previousFocus.current ??= document.activeElement as HTMLElement;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") save(false);
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const save = (functional: boolean) => {
    saveCookiePreferences(functional, settings ? "preferences" : "banner", document.documentElement.lang === "uk" ? "UA" : "EN");
    setOpen(false);
    setSettings(false);
    window.setTimeout(() => previousFocus.current?.focus(), 0);
  };

  if (!open) return null;
  return <aside ref={dialogRef} className="cookie-banner" role="dialog" aria-modal="true" aria-labelledby="cookie-title" aria-describedby="cookie-description">
    <div className="flex items-start gap-4"><span aria-hidden="true" className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-cyan-100/[.1] bg-cyan-200/[.04]"><Cookie className="h-5 w-5 text-cyan-100/60" /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-4"><div><h2 id="cookie-title" className="text-lg font-medium">Необхідні cookie та функціональна мова</h2><p id="cookie-description" className="mt-2 text-sm leading-6 text-white/60">Supabase Auth cookie потрібні для входу й безпеки. Додатково можна дозволити localStorage лише для збереження мови. Analytics і marketing не підключені.</p></div><button ref={closeRef} type="button" onClick={() => save(false)} aria-label="Закрити та залишити лише необхідні" className="text-white/50 transition hover:text-white"><X className="h-5 w-5" /></button></div>
      {settings && <div className="mt-5 space-y-3 rounded-[1rem] border border-white/[.06] bg-black/15 p-4"><div className="flex items-center justify-between"><div><p className="text-sm">Необхідні</p><p className="mt-1 text-xs text-white/45">Supabase Auth session, security і збереження цього вибору.</p></div><span className="text-[10px] uppercase tracking-[.15em] text-cyan-100/65">Завжди</span></div><div className="flex items-center justify-between border-t border-white/[.06] pt-3"><div><p className="text-sm">Функціональні</p><p className="mt-1 text-xs text-white/45">Збереження обраної мови у браузері.</p></div><span className="text-[10px] uppercase tracking-[.15em] text-white/50">За вибором</span></div><div className="flex items-center justify-between border-t border-white/[.06] pt-3"><div><p className="text-sm">Аналітичні та маркетингові</p><p className="mt-1 text-xs text-white/45">Не встановлюються у поточній версії.</p></div><span className="text-[10px] uppercase tracking-[.15em] text-white/40">Неактивні</span></div></div>}
      <div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" onClick={() => save(true)} className="future-button rounded-full px-5 py-2.5 text-xs">Дозволити мову</button><button type="button" onClick={() => save(false)} className="glass-button rounded-full px-5 py-2.5 text-xs">Лише необхідні</button><button type="button" aria-expanded={settings} onClick={() => setSettings((value) => !value)} className="inline-flex items-center gap-2 px-2 text-xs text-white/55 transition hover:text-white"><Settings2 className="h-3.5 w-3.5" />Деталі</button><Link href="/cookies" className="ml-auto text-xs text-cyan-100/65 hover:text-cyan-50">Cookie Policy</Link></div>
    </div></div>
  </aside>;
}
