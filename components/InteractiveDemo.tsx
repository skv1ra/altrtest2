"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Lang } from "./Navigation";

const demoCopy = {
  EN: {
    title: "Conversations become intelligence.",
    subtitle: "Altr observes the signal behind your replies: tone, timing, relationship and context.",
    tabs: ["Client", "Team", "Email"],
    client: "Incoming",
    altr: "Altr draft",
    messages: [
      { from: "Can you send the final price and delivery timeline today?", to: "Yes. I’ll send the final price and timeline today. I’m checking the final details now and will get back to you shortly." },
      { from: "Do you want us to approve the supplier change before lunch?", to: "Yes, approve it. Just double-check the lead time and send me the updated cost before confirming everything." },
      { from: "Could you review the proposal and share your comments?", to: "Yes, I’ll review it today and send comments shortly. I want to check the pricing and delivery terms first." },
    ],
    reveal: "Altr learns how you communicate across clients, teams and email — then helps you respond with context, tone and timing.",
  },
  UA: {
    title: "Переписки стають інтелектом.",
    subtitle: "Altr бачить сигнал за твоїми відповідями: тон, таймінг, стосунки й контекст.",
    tabs: ["Клієнт", "Команда", "Email"],
    client: "Вхідне",
    altr: "Чернетка Altr",
    messages: [
      { from: "Можеш сьогодні скинути фінальну ціну і терміни доставки?", to: "Так. Я сьогодні скину фінальну ціну і терміни. Зараз перевіряю останні деталі й скоро повернусь з відповіддю." },
      { from: "Підтверджуємо зміну постачальника до обіду?", to: "Так, підтверджуйте. Тільки перевірте термін поставки і скиньте мені оновлену ціну перед фінальним погодженням." },
      { from: "Можете переглянути пропозицію і дати коментарі?", to: "Так, перегляну сьогодні й надішлю коментарі. Спочатку хочу перевірити ціну та умови доставки." },
    ],
    reveal: "Altr вчиться, як ти спілкуєшся з клієнтами, командою та в email — а потім допомагає відповідати з правильним контекстом, тоном і таймінгом.",
  },
} as const;

export function InteractiveDemo({ lang }: { lang: Lang }) {
  const t = demoCopy[lang];
  const [activeIndex, setActiveIndex] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => setActiveIndex(0), [lang]);
  useEffect(() => {
    setTyping(true);
    const timer = window.setTimeout(() => setTyping(false), 660);
    return () => window.clearTimeout(timer);
  }, [activeIndex, lang]);

  const current = t.messages[activeIndex];

  return (
    <section id="product" className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:py-24">
      <div className="mb-8">
        <p className="eyebrow">Conversation learning demo</p>
        <h2 className="mt-4 max-w-2xl text-4xl font-medium tracking-[-0.055em] text-white md:text-6xl">{t.title}</h2>
      </div>

      <motion.div initial={{ opacity: 0, y: 24, filter: "blur(12px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, margin: "-120px" }} transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }} className="system-demo relative overflow-hidden rounded-[2.2rem] p-4 md:p-6">
        <div className="demo-scan" />
        <div className="absolute right-12 top-4 h-40 w-40 rounded-full bg-cyan-400/8 blur-[58px]" />
        <div className="relative mb-6 flex items-center justify-between gap-4 border-b border-cyan-100/[0.08] px-2 pb-4">
          <div className="flex items-center gap-7">
            {t.tabs.map((tab, index) => (
              <button key={tab} onClick={() => setActiveIndex(index)} className={`relative pb-2 text-sm tracking-[0.02em] transition ${activeIndex === index ? "text-cyan-50" : "text-white/34 hover:text-white/64"}`}>
                {tab}
                {activeIndex === index && <motion.span layoutId="chat-tab" className="absolute bottom-0 left-0 h-px w-full bg-cyan-200 shadow-[0_0_14px_rgba(103,232,249,.8)]" />}
              </button>
            ))}
          </div>
        </div>

        <div className="relative grid gap-4 md:grid-cols-[.9fr_1.1fr]">
          <div className="conversation-panel rounded-[1.55rem] p-5">
            <div className="mb-4 flex items-center justify-between text-xs text-white/38"><span>{t.client}</span><span>09:42</span></div>
            <div className="message-bubble message-in">{current.from}</div>
          </div>

          <div className="conversation-panel conversation-panel-active rounded-[1.55rem] p-5">
            <div className="mb-4 flex items-center justify-between text-xs text-white/38"><span>{t.altr}</span><span className="text-cyan-100/62">personality model</span></div>
            <div className="message-bubble message-out min-h-[112px]">
              <AnimatePresence mode="wait">
                {typing ? (
                  <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="typing-dots flex h-8 items-center gap-1.5"><span /><span /><span /></motion.div>
                ) : (
                  <motion.p key={`${activeIndex}-${lang}`} initial={{ opacity: 0, y: 8, filter: "blur(7px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0 }} transition={{ duration: 0.34 }}>{current.to}</motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="relative mt-5 inline-flex max-w-2xl items-center gap-3 rounded-full border border-white/[.07] bg-white/[.03] px-4 py-3 text-sm leading-6 text-white/45">
          <span className="status-dot-css" />
          <span>{t.subtitle}</span>
        </div>
      </motion.div>

      <motion.p initial={{ opacity: 0, y: 22, filter: "blur(12px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1], delay: 0.08 }} className="mx-auto mt-12 max-w-3xl text-center text-xl leading-9 tracking-[-0.03em] text-white/56 md:text-2xl">
        {t.reveal}
      </motion.p>
    </section>
  );
}