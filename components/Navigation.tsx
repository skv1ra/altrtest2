"use client";

import { motion } from "framer-motion";
import { UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentProfile } from "@/lib/auth";

export type Lang = "EN" | "UA";

const labels = {
  EN: { product: "Product", how: "How it works", memory: "Memory", assistants: "Assistants", vision: "Vision", pricing: "Pricing", profile: "Profile" },
  UA: { product: "Продукт", how: "Як працює", memory: "Памʼять", assistants: "Асистенти", vision: "Візія", pricing: "Тарифи", profile: "Профіль" },
};

export function AiMark() {
  return <span aria-hidden="true" className="ai-core-dot" />;
}

export function Navigation({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  const t = labels[lang];
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const syncSession = () => setSignedIn(Boolean(getCurrentProfile()));
    syncSession();
    window.addEventListener("altr-auth-change", syncSession);
    window.addEventListener("storage", syncSession);
    return () => {
      window.removeEventListener("altr-auth-change", syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 right-0 top-0 z-50 px-4 pt-4"
    >
      <nav className="control-bar mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <a href="#top" className="group flex items-center gap-2 text-[15px] font-semibold tracking-[0.01em] text-white">
          <span>Altr</span><AiMark />
        </a>
        <div className="hidden items-center gap-7 md:flex">
          <a href="#product" className="nav-link">{t.product}</a>
          <a href="#how" className="nav-link">{t.how}</a>
          <Link href="/memory" className="nav-link">{t.memory}</Link>
          <Link href="/assistants" className="nav-link">{t.assistants}</Link>
          <Link href="/pricing" className="nav-link">{t.pricing}</Link>
          <a href="#vision" className="nav-link">{t.vision}</a>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm tracking-[0.08em]">
            <button onClick={() => setLang("EN")} className={`language-link ${lang === "EN" ? "text-cyan-100" : "text-white/34"}`}>EN</button>
            <span className="text-white/16">/</span>
            <button onClick={() => setLang("UA")} className={`language-link ${lang === "UA" ? "text-cyan-100" : "text-white/34"}`}>UA</button>
          </div>
          <span className="hidden h-5 w-px bg-white/[.08] sm:block" />
          <Link
            href={signedIn ? "/dashboard" : "/auth?mode=register"}
            aria-label={t.profile}
            title={t.profile}
            className="profile-nav-button group"
          >
            <UserRound className="h-[17px] w-[17px]" />
            <span className="hidden text-xs tracking-[.04em] sm:inline">{t.profile}</span>
            {signedIn && <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-cyan-100 shadow-[0_0_10px_rgba(103,232,249,.95)]" />}
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
