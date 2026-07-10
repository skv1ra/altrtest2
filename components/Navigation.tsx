"use client";

import { motion } from "framer-motion";

export type Lang = "EN" | "UA";

const labels = {
  EN: { product: "Product", how: "How it works", memory: "Memory", vision: "Vision" },
  UA: { product: "Продукт", how: "Як працює", memory: "Памʼять", vision: "Візія" },
};

export function AiMark() {
  return <span aria-hidden="true" className="ai-core-dot" />;
}

export function Navigation({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  const t = labels[lang];

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
          <a href="#memory" className="nav-link">{t.memory}</a>
          <a href="#vision" className="nav-link">{t.vision}</a>
        </div>
        <div className="flex items-center gap-2 text-sm tracking-[0.08em]">
          <button onClick={() => setLang("EN")} className={`language-link ${lang === "EN" ? "text-cyan-100" : "text-white/34"}`}>EN</button>
          <span className="text-white/16">/</span>
          <button onClick={() => setLang("UA")} className={`language-link ${lang === "UA" ? "text-cyan-100" : "text-white/34"}`}>UA</button>
        </div>
      </nav>
    </motion.header>
  );
}
