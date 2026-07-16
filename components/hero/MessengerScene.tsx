"use client";

import { motion } from "framer-motion";

export function MessengerScene({ lang, replied, compact = false }: { lang: "EN" | "UA"; replied: boolean; compact?: boolean }) {
  const ua = lang === "UA";
  return <div className="flex h-full bg-[#0b1118] text-white">
    {!compact && <aside className="hidden w-[30%] border-r border-white/8 bg-[#0d141c] p-4 md:block">
      <div className="flex items-center gap-3"><div