"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { BrainCircuit } from "lucide-react";
import { MouseEvent } from "react";

const nodes = [
  [28, 24], [55, 16], [72, 31], [38, 48], [63, 55], [48, 77], [24, 68], [78, 75], [50, 38], [34, 84]
];

export function HeroOrb() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 18 });
  const sy = useSpring(my, { stiffness: 80, damping: 18 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-10, 10]);

  function onMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative mx-auto aspect-square w-full max-w-[520px]"
    >
      <div className="ai-grid absolute inset-0 opacity-70" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 34, ease: "linear", repeat: Infinity }}
        className="absolute inset-[7%] rounded-full border border-white/10 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,.18),rgba(74,125,255,.08)_34%,rgba(9,9,9,.08)_62%,transparent_72%)] shadow-glow"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 48, ease: "linear", repeat: Infinity }}
        className="absolute inset-[18%] rounded-full border border-blue-300/20 bg-[radial-gradient(circle_at_50%_50%,rgba(140,110,255,.18),transparent_57%)] shadow-violet"
      />
      <div className="glass absolute inset-[27%] grid place-items-center rounded-[42%]">
        <BrainCircuit className="h-20 w-20 text-white/90" strokeWidth={1.1} />
      </div>
      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="line" x1="0" x2="1">
            <stop stopColor="#ffffff" stopOpacity=".1" />
            <stop offset=".55" stopColor="#72a7ff" stopOpacity=".75" />
            <stop offset="1" stopColor="#b18cff" stopOpacity=".1" />
          </linearGradient>
        </defs>
        {nodes.slice(0, -1).map((node, i) => {
          const next = nodes[(i + 3) % nodes.length];
          return <motion.line key={i} x1={node[0]} y1={node[1]} x2={next[0]} y2={next[1]} stroke="url(#line)" strokeWidth=".35" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: .75 }} transition={{ duration: 2.6, delay: i * .12, repeat: Infinity, repeatType: "reverse" }} />;
        })}
        {nodes.map((node, i) => (
          <motion.circle key={i} cx={node[0]} cy={node[1]} r="1.25" fill="white" animate={{ opacity: [.25, 1, .25], scale: [1, 1.6, 1] }} transition={{ duration: 2.4, delay: i * .18, repeat: Infinity }} />
        ))}
      </svg>
      <div className="absolute left-8 top-16 h-24 w-24 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute bottom-12 right-8 h-28 w-28 rounded-full bg-violet-500/20 blur-3xl" />
    </motion.div>
  );
}
