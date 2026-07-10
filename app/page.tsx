"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { HeroOrb } from "@/components/HeroOrb";
import { InteractiveDemo } from "@/components/InteractiveDemo";
import { AiMark, Navigation, type Lang } from "@/components/Navigation";
import { Reveal } from "@/components/Reveal";

const copy = {
  EN: {
    eyebrow: "Personal AI activation interface",
    heroTitle: "Your digital self is being activated.",
    heroSubtitle: "Altr learns from the way you write, decide and communicate — then turns your communication patterns into a private intelligence layer.",
    cta: "Create Your Second Self",
    secondary: "View Learning System",
    statA: "Private tone model",
    statB: "Conversation memory",
    statC: "Context routing",
    cards: [
      ["How it works", "Connect your workflow.", "Altr reads the patterns across your chats, email and work context — then builds a live model of how you respond."],
      ["Memory", "Context that stays with you.", "People, tasks, decisions and conversations become a connected memory layer that follows your work."],
      ["Vision", "Not another assistant.", "A personal intelligence system that grows around your behavior until it can act as your digital second self."],
    ],
    featureTitle: "A quiet system for human patterns.",
    features: ["Tone fingerprint", "Decision memory", "Client context", "Email continuity", "Team workflows", "Autonomous drafts"],
    finalTitle: "Your routine is not your identity.",
    finalSubtitle: "Let Altr handle the patterns — so you can focus on what matters.",
    footer: { product: "Product", how: "How it works", memory: "Memory", vision: "Vision", privacy: "Privacy", terms: "Terms", status: "All systems learning" },
  },
  UA: {
    eyebrow: "Інтерфейс активації персонального AI",
    heroTitle: "Твоя цифрова версія активується.",
    heroSubtitle: "Altr вчиться з того, як ти пишеш, вирішуєш і спілкуєшся — а потім перетворює твої патерни в приватний intelligence layer.",
    cta: "Створити другого себе",
    secondary: "Показати систему навчання",
    statA: "Приватна модель тону",
    statB: "Памʼять переписок",
    statC: "Контекстні відповіді",
    cards: [
      ["Як це працює", "Підключи свій workflow.", "Altr зчитує патерни у чатах, пошті та робочому контексті — і будує живу модель твоїх відповідей."],
      ["Памʼять", "Контекст, який залишається з тобою.", "Люди, задачі, рішення та переписки стають повʼязаним шаром памʼяті навколо твоєї роботи."],
      ["Візія", "Не ще один асистент.", "Персональна AI-система, яка росте навколо твоєї поведінки, поки не стане твоїм цифровим другим я."],
    ],
    featureTitle: "Тиха система для людських патернів.",
    features: ["Відбиток тону", "Памʼять рішень", "Контекст клієнтів", "Email continuity", "Командні процеси", "Автономні чернетки"],
    finalTitle: "Твоя рутина — це не твоя особистість.",
    finalSubtitle: "Дозволь Altr взяти на себе повторювані патерни — щоб ти міг фокусуватись на важливому.",
    footer: { product: "Продукт", how: "Як працює", memory: "Памʼять", vision: "Візія", privacy: "Privacy", terms: "Terms", status: "Усі системи навчаються" },
  },
} as const;

function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <a href="/auth?mode=register" className="future-button group inline-flex items-center justify-center rounded-full px-6 py-4 text-sm font-medium tracking-[0.02em] text-white">
      <span>{children}</span>
      <span className="ml-3 h-1.5 w-1.5 rounded-full bg-cyan-100 shadow-[0_0_18px_rgba(125,211,252,.95)] transition duration-500 group-hover:scale-150" />
    </a>
  );
}

function SecondaryButton({ children }: { children: React.ReactNode }) {
  return <a href="#how" className="glass-button inline-flex items-center justify-center rounded-full px-6 py-4 text-sm font-medium text-white/70">{children}</a>;
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("EN");
  const t = copy[lang];

  return (
    <main id="top" className="relative min-h-screen overflow-hidden bg-[#05080c] text-white selection:bg-cyan-200 selection:text-black">
      <Navigation lang={lang} setLang={setLang} />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_15%,rgba(55,153,255,.13),transparent_31%),radial-gradient(circle_at_18%_46%,rgba(125,211,252,.055),transparent_30%),linear-gradient(180deg,#05080c_0%,#070b12_48%,#030407_100%)]" />
        <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(135,206,250,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(135,206,250,.08)_1px,transparent_1px)] [background-size:96px_96px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/35 to-transparent" />
      </div>

      <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 pb-20 pt-32 lg:grid-cols-[1fr_.95fr] lg:pt-28">
        <div className="max-w-3xl">
          <motion.p initial={{ opacity: 0, y: 12, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }} className="eyebrow mb-7 flex items-center gap-3">
            <span>ALTR OS</span><AiMark /><span>{t.eyebrow}</span>
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 24, filter: "blur(14px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="hero-gradient-sweep text-balance text-5xl font-medium leading-[0.96] tracking-[-0.072em] md:text-7xl lg:text-[6.7rem]">
            {t.heroTitle}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.75, delay: 0.12, ease: [0.16, 1, 0.3, 1] }} className="mt-8 max-w-2xl text-lg leading-8 tracking-[-0.02em] text-white/56 md:text-xl">
            {t.heroSubtitle}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.75, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton>{t.cta}</PrimaryButton><SecondaryButton>{t.secondary}</SecondaryButton>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.75, delay: 0.32, ease: [0.16, 1, 0.3, 1] }} className="mt-12 grid max-w-2xl grid-cols-1 gap-3 text-xs uppercase tracking-[0.18em] text-white/38 sm:grid-cols-3">
            {[t.statA, t.statB, t.statC].map((stat) => <div key={stat} className="micro-panel"><span className="status-dot-css" />{stat}</div>)}
          </motion.div>
        </div>

        <HeroOrb />
      </section>

      <InteractiveDemo lang={lang} />

      <section id="how" className="relative z-10 mx-auto max-w-7xl px-5 py-16 md:py-24">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <Reveal><h2 className="max-w-2xl text-4xl font-medium leading-tight tracking-[-0.055em] md:text-6xl">{t.featureTitle}</h2></Reveal>
          <Reveal delay={0.05}><p className="max-w-sm text-sm leading-7 text-white/42">{lang === "EN" ? "Every panel is a part of one private AI system: communication, memory, context and action." : "Кожна панель — частина однієї приватної AI-системи: комунікація, памʼять, контекст і дія."}</p></Reveal>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {t.cards.map(([title, subtitle, body], index) => (
            <Reveal key={title} delay={index * 0.04}>
              <article className="future-card group min-h-[310px] rounded-[2rem] p-7 md:p-8">
                <div className="mb-14 flex items-center justify-between">
                  <span className="data-label">SYS 0{index + 1}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-100/35 transition group-hover:bg-cyan-100 group-hover:shadow-[0_0_18px_rgba(103,232,249,.9)]" />
                </div>
                <h3 id={index === 1 ? "memory" : index === 2 ? "vision" : undefined} className="mb-4 text-2xl font-medium tracking-[-0.04em] text-white">{title}</h3>
                <p className="mb-5 text-lg tracking-[-0.03em] text-cyan-50/70">{subtitle}</p>
                <p className="max-w-sm leading-7 text-white/43">{body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-6">
          {t.features.map((feature, index) => (
            <Reveal key={feature} delay={index * 0.025}>
              <div className="data-chip"><span className="status-dot-css" />{feature}</div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative z-10 overflow-hidden px-5 py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(39,160,255,.095),transparent_45%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 rounded-[2.6rem] border border-cyan-200/[0.08] bg-white/[0.025] p-6 shadow-[0_28px_100px_rgba(0,0,0,.54)] backdrop-blur-md md:p-12 lg:grid-cols-[.9fr_1.1fr]">
          <div className="order-2 lg:order-1"><HeroOrb quiet /></div>
          <Reveal className="order-1 lg:order-2">
            <p className="eyebrow mb-5">FINAL ACTIVATION</p>
            <h2 className="text-balance text-5xl font-medium leading-[0.98] tracking-[-0.07em] md:text-7xl">{t.finalTitle}</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/50 md:text-xl">{t.finalSubtitle}</p>
            <div className="mt-9"><PrimaryButton>{t.cta}</PrimaryButton></div>
          </Reveal>
        </div>
      </section>

      <footer className="relative z-10 border-t border-cyan-100/[0.07] px-5 py-10">
        <div className="mx-auto grid max-w-7xl gap-9 md:grid-cols-[1.1fr_1.4fr_.8fr] md:items-start">
          <div>
            <a href="#top" className="flex items-center gap-2 text-sm font-semibold text-white"><span>Altr</span><AiMark /></a>
            <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-cyan-100/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-white/42"><span className="status-dot-css" />{t.footer.status}</div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-white/35 sm:grid-cols-4">
            <a className="footer-link" href="#product">{t.footer.product}</a><a className="footer-link" href="#how">{t.footer.how}</a><a className="footer-link" href="#memory">{t.footer.memory}</a><a className="footer-link" href="#vision">{t.footer.vision}</a>
            <a className="footer-link" href="https://x.com">X</a><a className="footer-link" href="https://github.com">GitHub</a><a className="footer-link" href="#">{t.footer.privacy}</a><a className="footer-link" href="#">{t.footer.terms}</a>
          </div>
          <p className="text-sm text-white/28 md:text-right">© 2026 Altr</p>
        </div>
      </footer>
    </main>
  );
}
