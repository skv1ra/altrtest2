"use client";

import { motion } from "framer-motion";

const nearNodes = [
  [18, 32, 52, 26], [24, 58, 41, 50], [54, 20, 63, 36], [66, 48, 79, 40],
  [34, 72, 52, 67], [58, 73, 75, 64], [21, 45, 35, 42], [72, 28, 83, 22],
];

const farNodes = [
  [6, 23, 18, 32], [7, 76, 24, 62], [88, 18, 75, 29], [92, 70, 77, 61],
  [34, 7, 43, 21], [63, 91, 57, 76], [13, 49, 27, 47], [82, 50, 68, 48],
];

export function HeroOrb({ quiet = false }: { quiet?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: "blur(18px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
      className={`digital-shadow relative mx-auto h-[520px] w-full max-w-[520px] ${quiet ? "scale-[0.86] opacity-80" : ""}`}
    >
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(72,126,255,.13),transparent_62%)] blur-2xl" />
      <div className="absolute left-1/2 top-[12%] h-[78%] w-[62%] -translate-x-1/2 rounded-[48%] bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,.08),rgba(20,24,32,.36)_24%,rgba(7,7,8,.92)_58%,rgba(0,0,0,0)_74%)]" />
      <div className="absolute left-1/2 top-[18%] h-[42%] w-[31%] -translate-x-1/2 rounded-[46%] bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,.06),rgba(16,17,22,.84)_48%,rgba(0,0,0,.96)_78%)] shadow-[0_0_55px_rgba(76,137,255,.22)]" />
      <div className="absolute left-[35%] top-[31%] h-[2px] w-[6px] rounded-full bg-white/18 blur-[.2px]" />
      <div className="absolute right-[35%] top-[31%] h-[2px] w-[6px] rounded-full bg-white/14 blur-[.2px]" />
      <div className="absolute left-1/2 top-[41%] h-[1px] w-[34px] -translate-x-1/2 bg-white/[0.045]" />
      <div className="absolute bottom-[10%] left-1/2 h-[45%] w-[68%] -translate-x-1/2 rounded-t-[42%] bg-[radial-gradient(circle_at_50%_12%,rgba(26,31,42,.75),rgba(5,5,6,.95)_62%,rgba(0,0,0,0)_77%)]" />

      <motion.div
        animate={{ opacity: [0.28, 0.56, 0.28], scale: [1, 1.015, 1] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-[10%] rounded-[45%] border border-blue-200/[0.06] shadow-[0_0_60px_rgba(75,132,255,.28),inset_0_0_42px_rgba(75,132,255,.07)]"
      />

      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="aura-line" x1="0" x2="1">
            <stop stopColor="#ffffff" stopOpacity=".02" />
            <stop offset=".52" stopColor="#7bb0ff" stopOpacity=".58" />
            <stop offset="1" stopColor="#ffffff" stopOpacity=".02" />
          </linearGradient>
        </defs>
        {[...nearNodes, ...farNodes].map(([x1, y1, x2, y2], index) => (
          <motion.line
            key={`${x1}-${y1}-${index}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="url(#aura-line)"
            strokeWidth={index < nearNodes.length ? 0.22 : 0.16}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0.15, 1, 0.15], opacity: [0.08, 0.62, 0.08] }}
            transition={{ duration: 3.8 + index * 0.18, repeat: Infinity, ease: "easeInOut", delay: index * 0.16 }}
          />
        ))}
        {[...nearNodes, ...farNodes].flatMap(([x1, y1, x2, y2], i) => [[x1, y1, i], [x2, y2, i + 20]]).map(([x, y, i]) => (
          <motion.circle
            key={`${x}-${y}-${i}`}
            cx={x}
            cy={y}
            r={Number(i) % 3 === 0 ? 0.75 : 0.48}
            fill="#dbeafe"
            animate={{ opacity: [0.14, 0.92, 0.14], scale: [1, 1.55, 1] }}
            transition={{ duration: 2.7, repeat: Infinity, ease: "easeInOut", delay: Number(i) * 0.09 }}
          />
        ))}
      </svg>

      <motion.div
        animate={{ y: [0, -10, 0], opacity: [0.4, 0.75, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[10%] top-[22%] h-24 w-24 rounded-full bg-blue-400/10 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 12, 0], opacity: [0.2, 0.48, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[8%] bottom-[18%] h-28 w-28 rounded-full bg-cyan-300/10 blur-3xl"
      />
    </motion.div>
  );
}
