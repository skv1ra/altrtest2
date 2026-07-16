"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { DesktopPC, IPhone, MacBook } from "./hero/DeviceShells";
import { MessengerScene } from "./hero/MessengerScene";

export function HeroSequence({ lang }: { lang: "EN" | "UA" }) {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (reduced) {
      setStage(2);
      return;
    }

    const timer = window.setInterval(() => {
      setStage((current) => (current + 1) % 6);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [reduced]);

  const showMacBook = stage <= 2 || stage === 5;
  const macBookContent =
    stage === 0 ? (
      <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_center,rgba(56,189,248,.13),transparent_45%),#05090d]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto h-12 w-12 rounded-full border border-sky-200/30 bg-sky-300/10 shadow-[0_0_40px_rgba(56,189,248,.2)]" />
          <p className="mt-5 text-sm text-white/40">Altr</p>
        </motion.div>
      </div>
    ) : (
      <MessengerScene lang={lang} replied={stage >= 2} />
    );

  return (
    <div className="relative min-h-[650px] overflow-hidden rounded-[44px] border border-sky-200/15 bg-[radial-gradient(circle_at_center,rgba(56,189,248,.12),transparent_44%),#030507] px-4 py-8 shadow-[0_45px_150px_rgba(0,0,0,.72)] md:min-h-[760px] md:px-8 md:py-12">
      <AnimatePresence mode="wait">
        {showMacBook && (
          <motion.div
            key={`mac-${stage}`}
            initial={{ opacity: 0, y: stage === 5 ? -20 : 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center px-3 md:px-8"
          >
            <MacBook lid={stage === 0 ? "opening" : stage === 5 ? "closing" : "open"}>
              {macBookContent}
            </MacBook>
          </motion.div>
        )}

        {stage === 3 && (
          <motion.div
            key="iphone"
            initial={{ opacity: 0, y: 130 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -130 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <IPhone>
              <MessengerScene lang={lang} replied compact />
            </IPhone>
          </motion.div>
        )}

        {stage === 4 && (
          <motion.div
            key="pc"
            initial={{ opacity: 0, y: 130 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -130 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center px-4 md:px-10"
          >
            <DesktopPC>
              <MessengerScene lang={lang} replied />
            </DesktopPC>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <button
            key={item}
            type="button"
            aria-label={`Animation step ${item + 1}`}
            onClick={() => setStage(item)}
            className={`h-2 rounded-full transition-all ${stage === item ? "w-9 bg-sky-300" : "w-2 bg-white/20"}`}
          />
        ))}
      </div>
    </div>
  );
}
