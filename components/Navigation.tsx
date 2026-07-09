"use client";

import { motion } from "framer-motion";

const nav = ["Brain", "Timeline", "Demo", "Future"];

export function Navigation() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="fixed left-0 right-0 top-0 z-40 px-4 py-4"
    >
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-3">
        <a href="#top" className="flex items-center gap-3 text-sm font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-ink">A</span>
          <span>Altr</span>
        </a>
        <div className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="rounded-full px-4 py-2 text-sm text-white/58 transition hover:bg-white/10 hover:text-white">
              {item}
            </a>
          ))}
        </div>
        <a href="#waitlist" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-ink transition hover:scale-[1.03]">
          Join Waitlist
        </a>
      </nav>
    </motion.header>
  );
}
