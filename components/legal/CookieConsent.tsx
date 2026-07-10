"use client";

import { Check, Settings2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getStoredLanguage, type Lang } from "@/lib/i18n/lang-store";
import { getCookiePreferences, saveCookiePreferences } from "@/lib/legal/cookie-store";

const copy = {
  EN: {
    title: "Your privacy controls",
    body: "Altr currently uses first-party browser storage for account, session, consent, language, and privacy features. No analytics or marketing tracker is active in this build.",
    accept: "Accept functional",
    reject: "Reject non-essential",
    customize: "Customize",
    modalTitle: "Cookie & storage preferences",
    modalBody: "Strictly necessary storage remains on for account and consent functionality. Analytics and marketing are unavailable because no provider is integrated.",
    necessary: "Strictly necessary",
    necessaryDescription: "Account, session, security, consent records, deletion requests, and your privacy choice.",
    functional: "Functional",
    functionalDescription: "Convenience features such as remembering the interface language.",
    analytics: "Analytics",
    analyticsDescription: "Not in use in this build.",
    marketing: "Marketing",
    marketingDescription: "Not in use in this build.",
    unavailable: "Not in use",
    save: "Save preferences",
    policy: "Read Cookie Policy",
    close: "Close preferences",
  },
  UA: {
    title: "Твої налаштування приватності",
    body: "Altr зараз використовує first-party browser storage для акаунта, сесії, згод, мови та privacy-функцій. У цій збірці немає активної аналітики чи маркетингових трекерів.",
    accept: "Прийняти функціональні",
    reject: "Відхилити необовʼязкове",
    customize: "Налаштувати",
    modalTitle: "Налаштування cookie та сховища",
    modalBody: "Строго необхідне сховище залишається активним для акаунта й записів згод. Аналітика та маркетинг недоступні, бо провайдери не інтегровані.",
    necessary: "Строго необхідні",
    necessaryDescription: "Акаунт, сесія, безпека, записи згод, запити на видалення й твій privacy-вибір.",
    functional: "Функціональні",
    functionalDescription: "Зручності, наприклад запамʼятовування мови інтерфейсу.",
    analytics: "Аналітика",
    analyticsDescription: "Не використовується в цій збірці.",
    marketing: "Маркетинг",
    marketingDescription: "Не використовується в цій збірці.",
    unavailable: "Не використовується",
    save: "Зберегти налаштування",
    policy: "Читати Cookie Policy",
    close: "Закрити налаштування",
  },
} as const;

export function CookieConsent() {
  const [lang, setLang] = useState<Lang>("EN");
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [functional, setFunctional] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const t = copy[lang];

  useEffect(() => {
    setLang(getStoredLanguage());
    const current = getCookiePreferences();
    if (current) setFunctional(current.functional);
    else {
      const timer = window.setTimeout(() => setShowBanner(true), 350);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const languageHandler = (event: Event) => setLang((event as CustomEvent<Lang>).detail ?? getStoredLanguage());
    const openHandler = () => {
      setFunctional(getCookiePreferences()?.functional ?? false);
      setShowModal(true);
    };
    window.addEventListener("altr-language-change", languageHandler);
    window.addEventListener("altr-open-cookie-preferences", openHandler);
    return () => {
      window.removeEventListener("altr-language-change", languageHandler);
      window.removeEventListener("altr-open-cookie-preferences", openHandler);
    };
  }, []);

  useEffect(() => {
    if (!showModal) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const modal = modalRef.current;
    const focusable = modal?.querySelectorAll<HTMLElement>("button, a[href], input:not([disabled])");
    focusable?.[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowModal(false);
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("keydown", handleKey); previousFocus?.focus(); };
  }, [showModal]);

  const apply = (nextFunctional: boolean, source: "banner" | "preferences") => {
    saveCookiePreferences(nextFunctional, source, lang);
    setFunctional(nextFunctional);
    setShowBanner(false);
    setShowModal(false);
  };

  return (
    <>
      {showBanner && (
        <section className="cookie-banner" aria-label={t.title}>
          <div className="cookie-banner-glow" />
          <div className="relative">
            <p className="data-label">PRIVACY CONTROL / V1</p>
            <h2 className="mt-3 text-xl font-medium tracking-[-.035em] text-white">{t.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/48">{t.body}</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button type="button" onClick={() => apply(true, "banner")} className="future-button rounded-full px-5 py-3 text-sm">{t.accept}</button>
              <button type="button" onClick={() => apply(false, "banner")} className="glass-button rounded-full px-5 py-3 text-sm">{t.reject}</button>
              <button type="button" onClick={() => setShowModal(true)} className="glass-button inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm"><Settings2 className="h-4 w-4" />{t.customize}</button>
              <Link href="/cookies" className="self-center px-3 py-2 text-xs text-cyan-100/55 transition hover:text-cyan-50">{t.policy}</Link>
            </div>
          </div>
        </section>
      )}

      {showModal && (
        <div className="cookie-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowModal(false); }}>
          <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="cookie-preferences-title" className="cookie-modal">
            <button type="button" onClick={() => setShowModal(false)} aria-label={t.close} className="cookie-close"><X className="h-4 w-4" /></button>
            <p className="data-label">ALTR / DEVICE STORAGE</p>
            <h2 id="cookie-preferences-title" className="mt-4 pr-10 text-2xl font-medium tracking-[-.045em]">{t.modalTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-white/45">{t.modalBody}</p>

            <div className="mt-7 space-y-3">
              <PreferenceRow title={t.necessary} description={t.necessaryDescription} state="on" />
              <PreferenceRow title={t.functional} description={t.functionalDescription} state={functional ? "on" : "off"} onToggle={() => setFunctional((value) => !value)} />
              <PreferenceRow title={t.analytics} description={t.analyticsDescription} state="unavailable" unavailable={t.unavailable} />
              <PreferenceRow title={t.marketing} description={t.marketingDescription} state="unavailable" unavailable={t.unavailable} />
            </div>

            <div className="mt-7 flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={() => apply(functional, "preferences")} className="future-button flex-1 rounded-full px-5 py-3 text-sm">{t.save}</button>
              <button type="button" onClick={() => apply(false, "preferences")} className="glass-button rounded-full px-5 py-3 text-sm">{t.reject}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PreferenceRow({ title, description, state, onToggle, unavailable }: { title: string; description: string; state: "on" | "off" | "unavailable"; onToggle?: () => void; unavailable?: string }) {
  return (
    <div className="cookie-preference-row">
      <div className="pr-4"><p className="text-sm font-medium text-white/86">{title}</p><p className="mt-1 text-xs leading-5 text-white/36">{description}</p></div>
      {state === "unavailable" ? <span className="rounded-full border border-white/[.07] px-2.5 py-1 text-[10px] uppercase tracking-[.12em] text-white/28">{unavailable}</span> : state === "on" && !onToggle ? <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-cyan-100/20 bg-cyan-200/[.08] text-cyan-50"><Check className="h-3.5 w-3.5" /></span> : <button type="button" role="switch" aria-checked={state === "on"} aria-label={title} onClick={onToggle} className={`toggle ${state === "on" ? "toggle-active" : ""}`}><span /></button>}
    </div>
  );
}
