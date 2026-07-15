"use client";

import { motion, type MotionProps, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 28, filter: "blur(14px)" }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: reducedMotion ? 0 : 0.8, ease: [0.16, 1, 0.3, 1], delay: reducedMotion ? 0 : delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const softSpring: MotionProps["transition"] = { type: "spring", stiffness: 90, damping: 18 };
