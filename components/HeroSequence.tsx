"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { IPhone, MacBook } from "./hero/DeviceShells";
import { MessengerScene } from "./hero/MessengerScene";

const durations = [1700, 2700, 3100, 3600, 1500, 1800];

function MacDesktop() {
  return (
    <div className="relative h-full overflow-hidden bg-[radial-gradient(circle_at_72%_26%,rgba(83,151,205,.38),transparent_27%),radial-gradient(circle_at_28%_68%,rgba(43,84,118,.46),transparent_35%),linear-gradient(145deg,#172c3d,#060c13_58%,#020406)]">
      <div className="absolute inset-x-0 top-0 flex h-7 items-center border-b border-white/[.05] bg-black/20 px-3 text-[8px] text-white/70 backdrop-blur-xl">
        <span className="text-[11px]">●</span><span className="ml-3 font-semibold">Finder</span><span className="ml-3">File</span><span className="ml-3">Edit</span><span className="ml-auto">Thu 15:22</span>
      </div>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-end gap-2 rounded-[14px] border border-white/[.08] bg-white/[.1] px-3 py-2 shadow-[0_14px_35px_rgba(0,0,0,.35)] backdrop-blur-2xl">
        {["#4da3ff", "#43c56b", "#805ad5", "#f4b942", "#ef5c64", "#4b5563"].map((color, index) => (
          <motion.span key={color} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.18 + index * 0.06 }} className="h-7 w-7 rounded-[7px] shadow-[inset_0_1px_rgba(255,255,255,.35),0_4px_10px_rgba(0,0,0,.24)]" style={{ background: color }} />
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="absolute inset-0 grid place-items-center">
        <div className="h-16 w-16 rounded-[18px] bg-[linear-gradient(145deg,#5bb7f1,#1b6fa8)] shadow-[0_16px_38px_rgba(0,0,0,.35),inset_0_1px_rgba(255,255,255,.35)]" />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,.05),transparent_20%,transparent_74%,rgba(255,255,255,.018))]" />
    </div>
  );
}

export function HeroSequence({ lang }: { lang: "EN" | "UA" }) {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (reduced) {
      setStage(2);
      return;
    }
    const timer = window.setTimeout(() => setStage((current) => (current + 1) % 6), durations[stage]);
    return () => window.clearTimeout(timer);
  }, [reduced, stage]);

  const device = stage === 3 ? "iphone" : "mac";
  const replied = stage >= 2;

  return (
    <div className="relative min-h-[680px] overflow-hidden rounded-[44px] border border-white/[.06] bg-[radial-gradient(ellipse_at_50%_84%,rgba(61,142,202,.18),transparent_42%),radial-gradient(circle_at_50%_35%,rgba(47,103,145,.12),transparent_38%),linear-gradient(180deg,#080c11,#020305)] shadow-[0_45px_150px_rgba(0,0,0,.72)] md:min-h-[790px]">
      <div className="pointer-events-none absolute inset-x-[8%] bottom-[8%] h-24 rounded-[50%] bg-black/70 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,.025),transparent_18%,transparent_80%,rgba(255,255,255,.018))]" />

      <AnimatePresence mode="sync" initial>
        {device === "mac" ? (
          <motion.div
            key="macbook"
            initial={stage === 0 ? { opacity: 0, scale: 0.96, y: 24, filter: "blur(8px)" } : { opacity: 0.1, y: "112%", scale: 0.97, filter: "blur(30px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0.08, y: "-112%", scale: 0.97, filter: "blur(30px)" }}
            transition={{ duration: stage === 0 ? 0.8 : 0.48, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center px-2 md:px-7"
          >
            <MacBook lid={stage === 0 ? "opening" : stage === 5 ? "closing" : "open"}>
              <AnimatePresence mode="wait" initial={false}>
                {stage === 0 ? (
                  <motion.div key="desktop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.025, filter: "blur(6px)" }} transition={{ duration: 0.42 }} className="h-full">
                    <MacDesktop />
                  </motion.div>
                ) : (
                  <motion.div key="messenger" initial={{ opacity: 0, scale: 0.94, filter: "blur(10px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} className="h-full">
                    <MessengerScene lang={lang} replied={replied} />
                  </motion.div>
                )}
              </AnimatePresence>
            </MacBook>
          </motion.div>
        ) : (
          <motion.div
            key="iphone"
            initial={{ opacity: 0.08, y: "112%", scale: 0.96, filter: "blur(32px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0.08, y: "-112%", scale: 0.96, filter: "blur(32px)" }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <IPhone><MessengerScene lang={lang} replied compact /></IPhone>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div aria-hidden="true" animate={{ opacity: device === "iphone" ? [0, 0.24, 0] : 0 }} transition={{ duration: 0.48 }} className="pointer-events-none absolute inset-x-0 top-1/2 h-28 -translate-y-1/2 bg-white/10 blur-3xl" />
    </div>
  );
}
