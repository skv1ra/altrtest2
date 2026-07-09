"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { HeroOrb } from "@/components/HeroOrb";
import { InteractiveDemo } from "@/components/InteractiveDemo";
import { AiMark, Navigation, type Lang } from "@/components/Navigation";
import { Reveal } from "@/components/Reveal";
import { PremiumFooter } from "@/components/PremiumFooter";

const copy = {
  EN: {
    heroTitle: "Your routine is not your identity.",
    heroSubtitle: "Let Altr handle the patterns — so you can focus on what matters.",
    cta: "Create Your Second Self",
    cards: [
      ["How it works", "Connect your workflow.", "Altr learns from your messages, email and work context."],
      ["Memory", "Context that stays with you.", "People, tasks, decisions and conversations — connected in one layer."],
      ["Vision", "Not another assistant.", "A personal intelligence layer that grows around the way you work."],
    ],
    footer: { product: "Product", how: "How it works", memory: "Memory", vision: "Vision", privacy: "Privacy", terms: "Terms" },
  },
  UA: {
    heroTitle: "Твоя рутина — це не твоя особистість.",
    heroSubtitle: "Дозволь Altr взяти на себе шаблони — щоб ти міг зосередитись на важливому.",
    cta: "Створити другого себе",
    cards: [
      ["Як це працює", "Підключи свій робочий процес.", "Altr вчиться на твоїх повідомленнях, email та робочому контексті."],
      ["Памʼять", "Контекст, який залишається з тобою.", "Люди, задачі, рішення та переписки — зʼєднані в одному шарі."],
      ["Візія", "Не ще один асистент.", "Персональний intelligence layer, який росте навколо того, як ти працюєш."],
    ],
    footer: { product: "Продукт", how: "Як це працює", memory: "Памʼять", vision: "Візія", privacy: "Privacy", terms: "Terms" },
  },
} as const;

function BlueButton({ children }: { children: React.ReactNode }) {
  return (
    <a href="#product" className="premium-button group inline-flex items-center justify-center rounded-full px-6 py-4 text-sm font-medium tracking-[-0.01em] text-white transition duration-500">
      <span>{children}</span>
      <span className="ml-3 h-1.5 w-1.5 rounded-full bg-blue-200 shadow-[0_0_14px_rgba(147,197,253,.85)] transition duration-500 group-hover:scale-150" />
    </a>
  );
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("EN");
  const t = copy[lang];

  return (
    <main id="top" className="relative min-h-screen overflow-hidden bg-[#090909] text-white selection:bg-blue-200 selection:text-black">
      <Navigation lang={lang} setLang={setLang} />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute right-[5%] top-[16%] h-[24rem] w-[24rem] rounded-full bg-blue-500/[0.07] blur-[112px]" />
        <div className="absolute left-[4%] top-[42%] h-[20rem] w-[20rem] rounded-full bg-violet-500/[0.035] blur-[112px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.05),transparent_38%)]" />
      </div>

      <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 pb-20 pt-28 lg:grid-cols-[1.02fr_.98fr] lg:pt-24">
        <div className="max-w-3xl">
          <motion.p initial={{ opacity: 0, y: 14, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="mb-7 flex items-center gap-3 text-sm text-white/38">
            <span>Altr</span><AiMark /><span>{lang === "EN" ? "personal intelligence layer" : "персональний intelligence layer"}</span>
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 22, filter: "blur(14px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="hero-gradient-sweep text-balance text-6xl font-medium leading-[0.94] tracking-[-0.075em] md:text-8xl lg:text-[7.4rem]">
            {t.heroTitle}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.75, delay: 0.12, ease: [0.16, 1, 0.3, 1] }} className="mt-8 max-w-xl text-lg leading-8 tracking-[-0.02em] text-white/52 md:text-xl">
            {t.heroSubtitle}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.75, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="mt-10">
            <BlueButton>{t.cta}</BlueButton>
          </motion.div>
        </div>

        <HeroOrb />
      </section>

      <InteractiveDemo lang={lang} />

      <section id="how" className="relative z-10 mx-auto max-w-7xl px-5 py-20 md:py-24">
        <div className="grid gap-4 md:grid-cols-3">
          {t.cards.map(([title, subtitle, body], index) => (
            <Reveal key={title} delay={index * 0.04}>
              <article className="premium-card group min-h-[300px] rounded-[2rem] p-7 md:p-8">
                <div className="mb-16 flex items-center justify-between">
                  <span className="text-sm text-white/38">0{index + 1}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-white/18 transition group-hover:bg-blue-200 group-hover:shadow-[0_0_18px_rgba(147,197,253,.85)]" />
                </div>
                <h3 id={index === 1 ? "memory" : index === 2 ? "vision" : undefined} className="mb-4 text-2xl font-medium tracking-[-0.045em] text-white">{title}</h3>
                <p className="mb-5 text-lg tracking-[-0.035em] text-white/72">{subtitle}</p>
                <p className="max-w-sm leading-7 text-white/43">{body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <PremiumFooter lang={lang} />
    </main>
  );
}
