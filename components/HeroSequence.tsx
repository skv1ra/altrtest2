"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Brain, Check, MessageCircle, Send, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

const copy = {
  EN: {
    learning: "Altr is learning your patterns",
    incoming: "New message from Daniel",
    message: "Did you review the updated supplier terms?",
    memory: "Context restored",
    memoryBody: "Pricing discussed 12 days ago. Final answer promised today.",
    draft: "Reply prepared",
    draftBody: "Yes. I reviewed the terms. I’ll send the final decision before 18:00.",
    control: "Waiting for your approval",
  },
  UA: {
    learning: "Altr вивчає твої патерни",
    incoming: "Нове повідомлення від Daniel",
    message: "Ти переглянув оновлені умови постачальника?",
    memory: "Контекст відновлено",
    memoryBody: "Ціну обговорювали 12 днів тому. Фінальну відповідь обіцяно сьогодні.",
    draft: "Відповідь готова",
    draftBody: "Так. Я переглянув умови. До 18:00 надішлю фінальне рішення.",
    control: "Очікує твого підтвердження",
  },
} as const;

export function HeroSequence({ lang }: { lang: "EN" | "UA" }) {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(reduced ? 2 : 0);
  const t = copy[lang];

  useEffect(() => {
    if (reduced) {
      setStage(2);
      return;
    }
    const timer = window.setInterval(() => setStage((value) => (value + 1) % 3), 3200);
    return () => window.clearInterval(timer);
  }, [reduced]);

  return (
    <div className="relative mx-auto aspect-[1.08/1] w-full max-w-[660px] overflow-hidden rounded-[40px] border border-sky-200/15 bg-[radial-gradient(circle_at_50%_42%,rgba(91,181,255,.17),transparent_32%),linear-gradient(145deg,#0b141e,#030608_72%)] shadow-[0_45px_150px_rgba(0,0,0,.72),0_0_90px_rgba(56,189,248,.09)]">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(125,211,252,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,.07)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      <motion.div
        aria-hidden="true"
        animate={reduced ? undefined : { x: ["-120%", "150%"] }}
        transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
        className="pointer-events-none absolute inset-y-0 w-28 -skew-x-12 bg-gradient-to-r from-transparent via-sky-200/10 to-transparent blur-xl"
      />

      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div
            key="core"
            initial={{ opacity: 0, scale: 0.84, filter: "blur(16px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.08, filter: "blur(14px)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
          >
            <div className="relative grid h-36 w-36 place-items-center rounded-full border border-sky-200/25 bg-sky-200/[.035] shadow-[0_0_90px_rgba(56,189,248,.18),inset_0_0_40px_rgba(56,189,248,.08)]">
              <motion.div
                animate={reduced ? undefined : { rotate: 360 }}
                transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
                className="absolute inset-3 rounded-full border border-dashed border-sky-200/20"
              />
              <div className="grid h-16 w-16 place-items-center rounded-full border border-sky-100/40 bg-[#07131d] shadow-[0_0_35px_rgba(125,211,252,.28)]">
                <Brain className="h-7 w-7 text-sky-100" />
              </div>
            </div>
            <h3 className="mt-8 text-2xl font-medium tracking-[-0.04em] text-white md:text-3xl">{t.learning}</h3>
            <div className="mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-white/8">
              <motion.div
                initial={{ width: "8%" }}
                animate={{ width: "82%" }}
                transition={{ duration: 2.4, ease: "easeInOut" }}
                className="h-full rounded-full bg-sky-300 shadow-[0_0_18px_rgba(125,211,252,.75)]"
              />
            </div>
          </motion.div>
        )}

        {stage === 1 && (
          <motion.div
            key="message"
            initial={{ opacity: 0, y: 36, scale: 0.92, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: -26, scale: 0.97 }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-5 flex items-center justify-center md:inset-10"
          >
            <div className="w-full overflow-hidden rounded-[32px] border border-sky-200/16 bg-[#071018]/95 shadow-[0_34px_100px_rgba(0,0,0,.65)]">
              <div className="flex h-14 items-center justify-between border-b border-white/7 px-5">
                <span className="flex items-center gap-3 text-sm text-white/70"><MessageCircle className="h-5 w-5 text-sky-300" />{t.incoming}</span>
                <span className="h-2.5 w-2.5 rounded-full bg-sky-300 shadow-[0_0_18px_rgba(125,211,252,.9)]" />
              </div>
              <div className="p-6 md:p-8">
                <div className="rounded-[24px] border border-white/8 bg-white/[.045] p-5 text-lg leading-8 text-white/80 md:p-7 md:text-xl">{t.message}</div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.1, delay: 0.25, ease: "easeInOut" }}
                  className="mt-7 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent shadow-[0_0_16px_rgba(125,211,252,.8)]"
                />
                <div className="mt-6 flex items-center gap-3 text-sm text-sky-100/65"><ShieldCheck className="h-5 w-5 text-sky-300" />Altr is restoring the situation</div>
              </div>
            </div>
          </motion.div>
        )}

        {stage === 2 && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.93, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-5 grid content-center gap-4 md:inset-8 md:grid-cols-2"
          >
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.18, duration: 0.55 }}
              className="rounded-[30px] border border-sky-200/14 bg-[#08121b]/95 p-5 shadow-[0_28px_80px_rgba(0,0,0,.55)] md:p-6"
            >
              <div className="flex items-center gap-3 text-base font-medium text-white"><Brain className="h-5 w-5 text-sky-300" />{t.memory}</div>
              <p className="mt-5 text-base leading-7 text-white/55">{t.memoryBody}</p>
              <div className="mt-6 flex items-center gap-2 text-sm text-sky-100/60"><Check className="h-4 w-4 text-sky-300" />Memory linked</div>
            </motion.div>

            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.34, duration: 0.55 }}
              className="rounded-[30px] border border-sky-300/25 bg-sky-300/[.055] p-5 shadow-[0_28px_80px_rgba(0,0,0,.55),0_0_45px_rgba(56,189,248,.08)] md:p-6"
            >
              <div className="flex items-center gap-3 text-base font-medium text-white"><Send className="h-5 w-5 text-sky-300" />{t.draft}</div>
              <p className="mt-5 text-base leading-7 text-white/75">{t.draftBody}</p>
              <button className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-sky-100 px-4 text-sm font-medium text-slate-950">
                {t.control}
              </button>
            </motion.div>

            <motion.div
              aria-hidden="true"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="pointer-events-none absolute bottom-8 left-1/2 top-8 hidden w-px origin-center bg-gradient-to-b from-transparent via-sky-300 to-transparent shadow-[0_0_18px_rgba(125,211,252,.85)] md:block"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {[0, 1, 2].map((item) => (
          <button
            key={item}
            type="button"
            aria-label={`Show animation step ${item + 1}`}
            onClick={() => setStage(item)}
            className={`h-2 rounded-full transition-all ${stage === item ? "w-8 bg-sky-300" : "w-2 bg-white/20"}`}
          />
        ))}
      </div>
    </div>
  );
}
