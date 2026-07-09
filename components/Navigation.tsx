"use client";

import { motion } from "framer-motion";

export type Lang = "EN" | "UA";

const labels = {
  EN: {
    product: "Product",
    how: "How it works",
    memory: "Memory",
    vision: "Vision",
  },
  UA: {
    product: "Продукт",
    how: "Як це працює",
    memory: "Памʼять",
    vision: "Візія",
  },
};

export function AiMark() {
  return <span aria-hidden="true" className="ai-core-dot" />;
}

export function Navigation({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  const t = labels[lang];

  return (
    <motion.header
      initial={{ opacity: 0, y: -14, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.055] bg-[#090909]/72 px-5 backdrop-blur-2xl"
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between">
        <a href="#top" className="group flex items-center gap-2 text-[15px] font-medium tracking-[-0.02em] text-white">
          <span>Altr</span>
          <AiMark />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#product" className="nav-link">{t.product}</a>
          <a href="#how" className="nav-link">{t.how}</a>
          <a href="#memory" className="nav-link">{t.memory}</a>
          <a href="#vision" className="nav-link">{t.vision}</a>
        </div>

        <div className="flex items-center gap-2 text-sm tracking-[-0.02em]">
          <button onClick={() => setLang("EN")} className={`language-link ${lang === "EN" ? "text-white" : "text-white/38"}`}>EN</button>
          <span className="text-white/18">/</span>
          <button onClick={() => setLang("UA")} className={`language-link ${lang === "UA" ? "text-white" : "text-white/38"}`}>UA</button>
        </div>
      </nav>
    </motion.header>
  );
}
