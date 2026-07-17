"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentProfile } from "@/lib/auth";
import type { Lang } from "@/lib/i18n/lang-store";

export type { Lang } from "@/lib/i18n/lang-store";

export function AltrMark({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`altr-mark ${className}`}>
      <span className="altr-mark-slit" />
    </span>
  );
}

export function AiMark() {
  return <AltrMark />;
}

export function AltrLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`altr-logo ${compact ? "is-compact" : ""}`}>
      <AltrMark />
      {!compact && <span>Altr</span>}
    </span>
  );
}

const copy = {
  EN: { product: "Product", how: "How it works", pricing: "Pricing", login: "Log in", dashboard: "Dashboard", menu: "Open menu", close: "Close menu", language: "Language" },
  UA: { product: "Продукт", how: "Як працює", pricing: "Ціни", login: "Увійти", dashboard: "Кабінет", menu: "Відкрити меню", close: "Закрити меню", language: "Мова" },
} as const;

export function Navigation({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  const t = copy[lang];
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => trigger.current?.focus(), 0);
  }, []);

  useEffect(() => {
    let active = true;
    const sync = () => getCurrentProfile().then((profile) => { if (active) setSignedIn(Boolean(profile)); });
    void sync();
    window.addEventListener("altr-auth-change", sync);
    return () => { active = false; window.removeEventListener("altr-auth-change", sync); };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY;
      setScrolled(next > 24);
      setVisible(next < 80 || next < lastY.current || open);
      lastY.current = next;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement;
    panel.current?.querySelector<HTMLElement>("a,button")?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [open, close]);

  const links = [
    { href: "/#product", label: t.product },
    { href: "/#how", label: t.how },
    { href: "/#pricing", label: t.pricing },
  ];

  return (
    <motion.header
      initial={reduced ? false : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: visible ? 0 : -96 }}
      className={`site-header ${scrolled ? "is-scrolled" : ""}`}
    >
      <nav aria-label="Primary" className="site-nav">
        <Link href="/#top" aria-label="Altr home"><AltrLogo /></Link>
        <div className="hidden items-center gap-9 md:flex">
          {links.map((link) => <Link key={link.href} href={link.href} className="site-nav-link">{link.label}</Link>)}
        </div>
        <div className="flex items-center gap-4">
          <div className="language-switch" aria-label={t.language}>
            {(["EN", "UA"] as Lang[]).map((code) => (
              <button key={code} type="button" aria-pressed={lang === code} onClick={() => setLang(code)}>{code}</button>
            ))}
          </div>
          <Link href={signedIn ? "/dashboard" : "/auth?mode=login"} className="site-login-link">
            {signedIn ? t.dashboard : t.login}
          </Link>
          <button ref={trigger} type="button" className="site-menu-button md:hidden" aria-label={open ? t.close : t.menu} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div className="site-mobile-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onPointerDown={(event) => { if (event.target === event.currentTarget) close(); }}>
            <motion.div ref={panel} role="dialog" aria-modal="true" className="site-mobile-panel" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {links.map((link) => <Link key={link.href} href={link.href} onClick={close}>{link.label}</Link>)}
              <Link href={signedIn ? "/dashboard" : "/auth?mode=login"} onClick={close}>{signedIn ? t.dashboard : t.login}</Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
