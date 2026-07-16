"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Brain, Check, Mail, MessageCircle, Send } from "lucide-react";
import { useEffect, useState } from "react";

const copy = {
  EN: {
    incomingTitle: "A message arrives",
    sender: "Daniel Kovalenko",
    message: "Did you review the updated supplier terms?",
    memoryTitle: "Altr uses your memory",
    memories: [
      "Pricing discussed 12 days ago",
      "New terms received on Monday",
      "Final answer promised today",
    ],
    replyTitle: "Altr replies",
    replyBody: "Yes. I reviewed the terms. I will send the final decision before 18:00.",
  },
  UA: {
    incomingTitle: "Надходить повідомлення",
    sender: "Daniel Kovalenko",
    message: "Ти переглянув оновлені умови постачальника?",
    memoryTitle: "Altr використовує памʼять",
    memories: [
      "Ціну обговорювали 12 днів тому",
      "Нові умови отримано в понеділок",
      "Фінальну відповідь обіцяно сьогодні",
    ],
    replyTitle: "Altr відповідає",
    replyBody: "Так. Я переглянув умови. До 18:00 надішлю фінальне рішення.",
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
    const timer = window.setInterval(() => {
      setStage((current) => (current + 1) % 3);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [reduced]);

  return (
    <div className="relative min-h-[540px] w-full overflow-hidden rounded-[42px] border border-sky-200/15 bg-[radial-gradient(circle_at_50%_45%,rgba(56,189,248,.16),transparent_34%),linear-gradient(145deg,#0b141e,#030608_72%)] shadow-[0_45px_150px_rgba(0,0,0,.72),0_0_90px_rgba(56,189,248,.09)] md:min-h-[620px]">
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(125,211,252,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,.07)_1px,transparent_1px)] [background-size:84px_84px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />

      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div
            key="incoming"
            initial={{ opacity: 0, y: 36, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.98 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex items-center justify-center p-6 md:p-12"
          >
            <div className="w-full max-w-3xl rounded-[34px] border border-white/10 bg-[#071018]/95 p-6 shadow-[0_34px_100px_rgba(0,0,0,.65)] md:p-9">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-base text-white/72 md:text-lg">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-sky-300/[.08] text-sky-300">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium text-white">{t.incomingTitle}</p>
                    <p className="mt-1 text-sm text-white/38">Telegram / Gmail / Messenger</p>
                  </div>
                </div>
                <motion.span
                  animate={reduced ? undefined : { scale: [1, 1.35, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className="h-3 w-3 rounded-full bg-sky-300 shadow-[0_0_20px_rgba(125,211,252,.9)]"
                />
              </div>

              <div className="mt-8 rounded-[26px] border border-white/8 bg-white/[.045] p-6 md:p-8">
                <p className="text-sm text-white/35">{t.sender}</p>
                <p className="mt-3 text-xl leading-8 text-white/85 md:text-2xl">{t.message}</p>
              </div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.3, delay: 0.25, ease: "easeInOut" }}
                className="mt-8 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent shadow-[0_0_18px_rgba(125,211,252,.8)]"
              />
            </div>
          </motion.div>
        )}

        {stage === 1 && (
          <motion.div
            key="memory"
            initial={{ opacity: 0, scale: 0.94, filter: "blur(14px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.03, filter: "blur(10px)" }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex items-center justify-center p-6 md:p-12"
          >
            <div className="relative w-full max-w-4xl rounded-[36px] border border-sky-200/15 bg-[#08121b]/95 p-7 shadow-[0_32px_100px_rgba(0,0,0,.62)] md:p-10">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-full border border-sky-200/20 bg-sky-300/[.05] text-sky-300">
                  <Brain className="h-6 w-6" />
                </span>
                <h3 className="text-2xl font-medium tracking-[-0.04em] md:text-3xl">{t.memoryTitle}</h3>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {t.memories.map((memory, index) => (
                  <motion.div
                    key={memory}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 + index * 0.18, duration: 0.5 }}
                    className="rounded-[24px] border border-white/8 bg-white/[.035] p-5 text-base leading-7 text-white/58"
                  >
                    <Check className="mb-5 h-5 w-5 text-sky-300" />
                    {memory}
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.75, duration: 0.7 }}
                className="mt-9 h-px origin-center bg-gradient-to-r from-transparent via-sky-300 to-transparent shadow-[0_0_20px_rgba(125,211,252,.85)]"
              />
            </div>
          </motion.div>
        )}

        {stage === 2 && (
          <motion.div
            key="reply"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex items-center justify-center p-6 md:p-12"
          >
            <div className="w-full max-w-3xl rounded-[36px] border border-sky-300/24 bg-sky-300/[.055] p-7 shadow-[0_34px_100px_rgba(0,0,0,.62),0_0_50px_rgba(56,189,248,.1)] md:p-10">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-sky-100 text-slate-950">
                  <Send className="h-6 w-6" />
                </span>
                <h3 className="text-2xl font-medium tracking-[-0.04em] md:text-3xl">{t.replyTitle}</h3>
              </div>

              <div className="mt-8 rounded-[26px] border border-white/10 bg-black/20 p-6 md:p-8">
                <p className="text-xl leading-8 text-white/82 md:text-2xl">{t.replyBody}</p>
              </div>

              <div className="mt-7 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-sm text-white/45">
                  <Mail className="h-4 w-4 text-sky-300" />
                  Sent through connected messenger
                </div>
                <motion.div
                  animate={reduced ? undefined : { x: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="rounded-full bg-sky-100 px-5 py-3 text-sm font-medium text-slate-950"
                >
                  Sent
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {[0, 1, 2].map((item) => (
          <button
            key={item}
            type="button"
            aria-label={`Show animation step ${item + 1}`}
            onClick={() => setStage(item)}
            className={`h-2 rounded-full transition-all ${stage === item ? "w-10 bg-sky-300" : "w-2 bg-white/20"}`}
          />
        ))}
      </div>
    </div>
  );
}
