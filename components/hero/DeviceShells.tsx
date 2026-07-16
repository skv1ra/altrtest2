"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type MacBookProps = { children: ReactNode; lid: "opening" | "open" | "closing" };

export function MacBook({ children, lid }: MacBookProps) {
  const closing = lid === "closing";
  return (
    <div className="relative mx-auto w-full max-w-[1120px] [perspective:2200px]">
      <motion.div
        initial={lid === "opening" ? { rotateX: -88, y: 88 } : false}
        animate={{ rotateX: closing ? -88 : -3.5, y: closing ? 88 : 0 }}
        transition={{ duration: closing ? 1.05 : 1.25, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "50% 100%", transformStyle: "preserve-3d" }}
        className="relative z-20 mx-auto aspect-[16/10] w-[78%] rounded-t-[24px] bg-[linear-gradient(145deg,#777c82_0%,#272b30_8%,#090a0c_22%,#050607_82%,#454a50_100%)] p-[7px] shadow-[0_45px_120px_rgba(0,0,0,.78),0_0_70px_rgba(85,178,255,.08)]"
      >
        <div className="relative h-full overflow-hidden rounded-t-[17px] bg-black ring-1 ring-white/[.06]">
          <div className="absolute left-1/2 top-0 z-30 h-[18px] w-[108px] -translate-x-1/2 rounded-b-[12px] bg-[#050607]">
            <i className="absolute left-1/2 top-[5px] h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-[#14202a] shadow-[0_0_5px_rgba(74,156,220,.45)]" />
          </div>
          <div className="h-full bg-[#06090d]">{children}</div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,.075),transparent_18%,transparent_72%,rgba(255,255,255,.025))]" />
        </div>
      </motion.div>

      <div className="relative z-10 mx-auto -mt-px h-[14px] w-[80%] rounded-b-md bg-[linear-gradient(180deg,#25292e,#0d0f12)] shadow-[0_5px_10px_rgba(0,0,0,.55)]" />
      <div
        className="relative z-0 mx-auto -mt-[2px] h-[118px] w-[94%] overflow-hidden rounded-b-[42px] bg-[linear-gradient(160deg,#e6e8ea_0%,#b8bdc2_26%,#8b9299_67%,#5c6269_100%)] shadow-[0_28px_48px_rgba(0,0,0,.52)] [clip-path:polygon(5%_0,95%_0,100%_100%,0_100%)]"
        style={{ transform: "perspective(900px) rotateX(68deg)", transformOrigin: "50% 0" }}
      >
        <div className="absolute left-[11%] right-[11%] top-4 grid grid-cols-12 gap-[3px] opacity-70">
          {Array.from({ length: 48 }).map((_, index) => (
            <span key={index} className="h-[8px] rounded-[2px] bg-[#34393e] shadow-[inset_0_1px_rgba(255,255,255,.15)]" />
          ))}
        </div>
        <div className="absolute bottom-5 left-1/2 h-12 w-[29%] -translate-x-1/2 rounded-[9px] border border-black/15 bg-[#aeb4b9]/45 shadow-[inset_0_1px_rgba(255,255,255,.38)]" />
        <div className="absolute bottom-0 left-1/2 h-[7px] w-[135px] -translate-x-1/2 rounded-t-xl bg-[#737a81]" />
      </div>
      <div className="mx-auto -mt-[21px] h-[7px] w-[86%] rounded-b-[50%] bg-[#555b61] shadow-[0_8px_18px_rgba(0,0,0,.45)]" />
    </div>
  );
}

export function IPhone({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto h-[618px] w-[302px] rounded-[58px] bg-[linear-gradient(145deg,#b3b6b8_0%,#35393d_10%,#070809_36%,#25292d_83%,#9da1a4_100%)] p-[6px] shadow-[0_48px_120px_rgba(0,0,0,.8),0_0_70px_rgba(72,164,240,.09)]">
      <span className="absolute -left-[4px] top-[105px] h-8 w-[4px] rounded-l bg-[#555a5e]" />
      <span className="absolute -left-[4px] top-[155px] h-[72px] w-[4px] rounded-l bg-[#555a5e]" />
      <span className="absolute -right-[4px] top-[150px] h-[92px] w-[4px] rounded-r bg-[#555a5e]" />
      <div className="relative h-full overflow-hidden rounded-[52px] bg-black ring-1 ring-white/[.08]">
        <div className="absolute left-1/2 top-[11px] z-30 h-[27px] w-[96px] -translate-x-1/2 rounded-full bg-black shadow-[0_2px_7px_rgba(0,0,0,.55)]">
          <i className="absolute right-[10px] top-[9px] h-[7px] w-[7px] rounded-full bg-[#102433] shadow-[0_0_4px_rgba(46,122,176,.35)]" />
        </div>
        <div className="absolute left-0 right-0 top-0 z-20 flex h-12 items-center justify-between px-6 text-[10px] font-medium text-white/85">
          <span>9:41</span><span className="tracking-[.12em]">● ● ▰</span>
        </div>
        <div className="h-full bg-[#070b10] pt-11">{children}</div>
        <div className="absolute bottom-[7px] left-1/2 z-30 h-[5px] w-[112px] -translate-x-1/2 rounded-full bg-white/85" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,.055),transparent_22%,transparent_72%,rgba(255,255,255,.02))]" />
      </div>
    </div>
  );
}
