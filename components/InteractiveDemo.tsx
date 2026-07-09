"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Lang } from "./Navigation";

const demoCopy = {
  EN: {
    title: "Altr in conversation.",
    subtitle: "A private reply layer for clients, teams and email — with your tone, context and timing.",
    tabs: ["Client", "Team", "Email"],
    client: "Client",
    altr: "Altr",
    messages: {
      Client: {
        from: "Can you send the final price and delivery timeline today?",
        to: "Yes. I’ll send the final price and timeline today. I’m checking the final details now and will get back to you shortly.",
      },
      Team: {
        from: "Do you want us to approve the supplier change before lunch?",
        to: "Yes, approve it. Just double-check the lead time and send me the updated cost before confirming everything.",
      },
      Email: {
        from: "Could you review the proposal and share your comments?",
        to: "Yes, I’ll review it today and send comments shortly. I want to check the pricing and delivery terms first.",
      },
    },
    labels: ["Tone matched", "Client context found", "Short reply mode"],
    reveal: "Altr learns how you communicate across clients, teams and email — then helps you respond with context, tone and timing.",
  },
  UA: {
    title: "Altr у переписці.",
    subtitle: "Приватний шар відповідей для клієнтів, команди й пошти — з твоїм тоном, контекстом і таймінгом.",
    tabs: ["Клієнт", "Команда", "Email"],
    client: "Клієнт",
    altr: "Altr",
    messages: {
      Клієнт: {
        from: "Можеш сьогодні скинути фінальну ціну і терміни доставки?",
        to: "Так. Я сьогодні скину фінальну ціну і терміни. Зараз перевіряю останні деталі й скоро повернусь з відповіддю.",
      },
      Команда: {
        from: "Підтверджуємо зміну постачальника до обіду?",
        to: "Так, підтверджуйте. Тільки перевірте термін поставки і скиньте мені оновлену ціну перед фінальним погодженням.",
      },
      Email: {
        from: "Можете переглянути пропозицію і дати коментарі?",
        to: "Так, перегляну сьогодні й надішлю коментарі. Спочатку хочу перевірити ціну та умови доставки.",
      },
    },
    labels: ["Тон збережено", "Контекст знайдено", "Короткий режим"],
    reveal: "Altr вчиться, як ти спілкуєшся з клієнтами, командою та в email — а потім допомагає відповідати з правильним контекстом, тоном і таймінгом.",
  },
} as const;

export function InteractiveDemo({ lang }: { lang: Lang }) {
  const t = demoCopy[lang];
  const [activeIndex, setActiveIndex] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    setActiveIndex(0);
  }, [lang]);

  useEffect(() => {
    setTyping(true);
    const timer = window.setTimeout(() => setTyping(false), 1050);
    return () => window.clearTimeout(timer);
  }, [activeIndex, lang]);

  const active = t.tabs[activeIndex];
  const current = Object.values(t.messages)[activeIndex];

  return (
    <section id="product" className="relative z-10 mx-auto max-w-6xl px-5 py-24 md:py-32">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Live demo</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-medium tracking-[-0.055em] text-white md:text-6xl">{t.title}</h2>
        </div>
        <p className="max-w-sm text-base leading-7 text-white/45">{t.subtitle}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 34, filter: "blur(18px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="premium-chat relative overflow-hidden rounded-[2.2rem] border border-white/[0.09] bg-white/[0.035] p-4 shadow-[0_0_0_1px_rgba(255,255,255,.025),0_28px_110px_rgba(0,0,0,.55)] backdrop-blur-2xl md:p-6"
      >
        <div className="absolute right-12 top-4 h-44 w-44 rounded-full bg-blue-500/10 blur-[60px]" />
        <div className="relative mb-6 flex items-center gap-7 border-b border-white/[0.07] px-2 pb-4">
          {t.tabs.map((tab, index) => (
            <button key={tab} onClick={() => setActiveIndex(index)} className={`relative pb-2 text-sm transition ${activeIndex === index ? "text-white" : "text-white/36 hover:text-white/64"}`}>
              {tab}
              {activeIndex === index && <motion.span layoutId="chat-tab" className="absolute bottom-0 left-0 h-px w-full bg-blue-300 shadow-[0_0_16px_rgba(111,166,255,.9)]" />}
            </button>
          ))}
        </div>

        <div className="relative grid gap-4 md:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-[1.55rem] border border-white/[0.07] bg-black/28 p-5">
            <div className="mb-4 flex items-center justify-between text-xs text-white/38">
              <span>{t.client}</span>
              <span>09:42</span>
            </div>
            <div className="message-bubble message-in">{current.from}</div>
          </div>

          <div className="rounded-[1.55rem] border border-blue-200/[0.11] bg-blue-300/[0.035] p-5 shadow-[inset_0_0_40px_rgba(72,126,255,.035)]">
            <div className="mb-4 flex items-center justify-between text-xs text-white/38">
              <span>{t.altr}</span>
              <span className="text-blue-100/62">personality layer</span>
            </div>
            <div className="message-bubble message-out min-h-[112px]">
              <AnimatePresence mode="wait">
                {typing ? (
                  <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-8 items-center gap-1.5">
                    {[0, 1, 2].map((dot) => (
                      <motion.span key={dot} animate={{ y: [0, -5, 0], opacity: [0.28, 1, 0.28] }} transition={{ duration: 0.72, delay: dot * 0.11, repeat: Infinity }} className="h-1.5 w-1.5 rounded-full bg-blue-100" />
                    ))}
                  </motion.div>
                ) : (
                  <motion.p key={`${active}-${lang}`} initial={{ opacity: 0, y: 10, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0 }} transition={{ duration: 0.48 }}>
                    {current.to}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap gap-2">
          {t.labels.map((label) => (
            <span key={label} className="ai-label">{label}</span>
          ))}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 28, filter: "blur(18px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
        className="mx-auto mt-12 max-w-3xl text-center text-xl leading-9 tracking-[-0.03em] text-white/56 md:text-2xl"
      >
        {t.reveal}
      </motion.p>
    </section>
  );
}
