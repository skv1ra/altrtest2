"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type MacBookProps = { children: ReactNode; lid: "opening" | "open" | "closing" };

export function MacBook({ children, lid }: MacBookProps) {
  const opening = lid === "opening";
  const closing = lid === "closing";
  return <div className="relative mx-auto w-full max-w-[1050px] [perspective:1800px]">
    <motion.div initial={opening ? { rotateX: -86 } : false} animate={{ rotateX: closing ? -86 : 0 }} transition={{ duration: 1.35, ease: [0.16,1,0.3,1] }} style={{ transformOrigin: "50% 100%", transformStyle: "preserve-3d" }} className="relative mx-auto aspect-[16/10] w-[82%] rounded-t-[26px] bg-[linear-gradient(145deg,#4c5158,#15181d_16%,#08090b_84%,#353a40)] p-[10px] shadow-[0_40px_110px_rgba(0,0,0,.75),0_0_70px_rgba(56,189,248,.07)]">
      <div className="relative h-full overflow-hidden rounded-t-[17px] border border-white/5 bg-black">
        <div className="absolute left-1/2 top-0 z-20 h-[18px] w-[92px] -translate-x-1/2 rounded-b-[12px] bg-[#08090b]"><i className="absolute left-1/2 top-[5px] h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-[#1e2933] shadow-[0_0_5px_rgba(80,160,220,.35)]"/></div>
        <div className="h-full bg-[linear-gradient(145deg,#07111a,#020406)]">{children}</div>
      </div>
    </motion.div>
    <div className="relative mx-auto h-[28px] w-[92%] rounded-b-[20px] bg-[linear-gradient(180deg,#d8dce0_0%,#a4aab0_30%,#6d737a_75%,#41464c)] shadow-[0_18px_28px_rgba(0,0,0,.5)] [clip-path:polygon(5%_0,95%_0,100%_100%,0_100%)]"><span className="absolute left-1/2 top-0 h-[7px] w-[130px] -translate-x-1/2 rounded-b-[10px] bg-[#777d84]"/></div>
    <div className="mx-auto h-[5px] w-[84%] rounded-b-[50%] bg-[#555b62]"/>
  </div>;
}

export function IPhone({ children }: { children: ReactNode }) {
  return <div className="relative mx-auto h-[590px] w-[286px] rounded-[54px] bg-[linear-gradient(145deg,#34383e,#050607_38%,#1d2024)] p-[8px] shadow-[0_45px_110px_rgba(0,0,0,.75),0_0_60px_rgba(56,189,248,.08)]">
    <span className="absolute -left-[3px] top-28 h-20 w-[3px] rounded-l bg-[#2b2f34]"/><span className="absolute -right-[3px] top-36 h-24 w-[3px] rounded-r bg-[#2b2f34]"/>
    <div className="relative h-full overflow-hidden rounded-[46px] bg-black"><div className="absolute left-1/2 top-3 z-20 h-[25px] w-[92px] -translate-x-1/2 rounded-full bg-black"><i className="absolute right-3 top-2 h-2 w-2 rounded-full bg-[#152431]"/></div><div className="h-full bg-[linear-gradient(145deg,#07111a,#020406)] pt-3">{children}</div></div>
  </div>;
}

export function DesktopPC({ children }: { children: ReactNode }) {
  return <div className="relative mx-auto flex w-full max-w-[1000px] items-end justify-center gap-8">
    <div className="relative w-[72%]"><div className="aspect-[16/10] rounded-[24px] bg-[linear-gradient(145deg,#4a4e54,#121417_18%,#060708_82%,#34383d)] p-[10px] shadow-[0_45px_110px_rgba(0,0,0,.72)]"><div className="h-full overflow-hidden rounded-[15px] bg-black">{children}</div></div><div className="mx-auto h-24 w-7 bg-[linear-gradient(90deg,#555b62,#c2c6ca,#5a6067)]"/><div className="mx-auto h-4 w-56 rounded-full bg-[linear-gradient(180deg,#bfc3c7,#747a81)]"/></div>
    <div className="hidden h-[360px] w-[150px] rounded-[24px] bg-[linear-gradient(145deg,#353a40,#0c0e11_38%,#272c31)] p-4 shadow-[0_35px_80px_rgba(0,0,0,.65)] md:block"><div className="h-full rounded-[16px] border border-white/7 bg-black/35 p-4"><div className="h-12 rounded-xl bg-sky-300/10"/><div className="mt-5 grid gap-3">{[1,2,3,4].map(x=><span key={x} className="h-2 rounded-full bg-white/8"/>)}</div></div></div>
  </div>;
}
