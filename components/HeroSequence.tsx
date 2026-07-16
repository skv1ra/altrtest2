"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export function HeroSequence({ lang }: { lang: "EN" | "UA" }) {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(reduced ? 3 : 0);
  const ua = lang === "UA";

  useEffect(() => {
    if (reduced) { setStage(3); return; }
    const timer = window.setInterval(() => setStage((value) => (value + 1) % 4), 3200);
    return () => window.clearInterval(timer);
  }, [reduced]);

  const content = [
    <div key="message" className="mx-auto max-w-2xl rounded-[28px] border border-white/10 bg-white/[.045] p-6 md:p-9">
      <p className="text-sm text-white/35">Telegram · Daniel</p>
      <h3 className="mt-2 text-2xl font-medium">{ua ? "Нове повідомлення" : "New message"}</h3>
      <p className="mt-7 rounded-[22px] bg-black/25 p-5 text-lg leading-8 text-white/80 md:text-xl">{ua ? "Ти переглянув оновлені умови постачальника?" : "Did you review the updated supplier terms?"}</p>
    </div>,
    <div key="memory" className="mx-auto max-w-3xl rounded-[28px] border border-sky-200/15 bg-sky-300/[.04] p-6 md:p-9">
      <h3 className="text-2xl font-medium">{ua ? "Altr відновлює контекст" : "Altr restores context"}</h3>
      <div className="mt-7 grid gap-3 md:grid-cols-3">{(ua ? ["Ціну обговорювали 12 днів тому", "Нові умови отримано в понеділок", "Відповідь обіцяно сьогодні"] : ["Pricing discussed 12 days ago", "New terms received Monday", "Final answer promised today"]).map((item,index)=><motion.div key={item} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:index*.18}} className="rounded-[20px] border border-white/8 bg-black/20 p-4 text-sm leading-6 text-white/60">✓ {item}</motion.div>)}</div>
    </div>,
    <div key="reply" className="mx-auto max-w-2xl rounded-[28px] border border-sky-300/25 bg-sky-300/[.07] p-6 md:p-9">
      <h3 className="text-2xl font-medium">{ua ? "Altr відповідає" : "Altr replies"}</h3>
      <p className="mt-7 rounded-[22px] bg-black/25 p-5 text-lg leading-8 text-white/85 md:text-xl">{ua ? "Так. Я переглянув умови. До 18:00 надішлю фінальне рішення." : "Yes. I reviewed the terms. I will send the final decision before 18:00."}</p>
      <motion.div animate={{x:[0,7,0]}} transition={{repeat:Infinity,duration:1.4}} className="ml-auto mt-6 w-fit rounded-full bg-sky-100 px-5 py-3 text-sm font-medium text-slate-950">{ua ? "Надіслано" : "Sent"}</motion.div>
    </div>
  ];

  return <div className="relative min-h-[590px] overflow-hidden rounded-[42px] border border-sky-200/15 bg-[radial-gradient(circle_at_center,rgba(56,189,248,.15),transparent_42%),#05090d] p-5 shadow-[0_45px_150px_rgba(0,0,0,.72)] md:min-h-[690px] md:p-10">
    {stage < 3 ? <motion.div key="tablet" initial={{opacity:0,scale:.92}} animate={{opacity:1,scale:1}} className="absolute inset-5 flex items-center justify-center md:inset-10">
      <div className="relative flex h-full max-h-[560px] w-full max-w-[980px] items-center justify-center rounded-[42px] border-[12px] border-[#171a1f] bg-[#071018] p-5 shadow-[0_35px_100px_rgba(0,0,0,.72),inset_0_0_0_1px_rgba(255,255,255,.06)] md:p-10">
        <span className="absolute left-1/2 top-2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]"/>
        <motion.div key={stage} initial={{opacity:0,y:22,filter:"blur(10px)"}} animate={{opacity:1,y:0,filter:"blur(0px)"}} transition={{duration:.65}} className="w-full">{content[stage]}</motion.div>
      </div>
    </motion.div> : <motion.div key="devices" initial={{opacity:0,scale:.82}} animate={{opacity:1,scale:1}} transition={{duration:.9,ease:[.16,1,.3,1]}} className="absolute inset-3 flex items-center justify-center md:inset-8">
      <div className="relative h-[500px] w-full max-w-[1120px]">
        <motion.div initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:.1,duration:.75}} className="absolute bottom-10 left-1/2 w-[62%] -translate-x-1/2">
          <div className="relative aspect-[16/10] overflow-hidden rounded-t-[26px] border-[10px] border-[#111318] bg-black shadow-[0_40px_90px_rgba(0,0,0,.75),0_0_60px_rgba(56,189,248,.08)]">
            <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-xl bg-[#111318]"/><div className="absolute left-1/2 top-1.5 z-20 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#222831]"/>
            <div className="h-full bg-[radial-gradient(circle_at_50%_30%,rgba(56,189,248,.16),transparent_38%),linear-gradient(145deg,#0a1620,#030608)] p-6 md:p-8"><div className="flex h-full flex-col rounded-[16px] border border-white/8 bg-white/[.025] p-5"><span className="text-sm text-sky-200">Altr</span><div className="mt-auto grid gap-3 md:grid-cols-3">{["Message","Memory","Reply"].map((x,i)=><div key={x} className="rounded-xl border border-white/8 bg-black/20 p-3 text-xs text-white/50"><span className="text-sky-300">0{i+1}</span><p className="mt-2">{x}</p></div>)}</div></div></div>
          </div>
          <div className="relative h-6 rounded-b-[22px] bg-[linear-gradient(180deg,#c7ccd2,#8d949d)] shadow-[0_14px_30px_rgba(0,0,0,.45)]"><div className="absolute left-1/2 top-0 h-2 w-28 -translate-x-1/2 rounded-b-xl bg-[#777e86]"/></div>
          <div className="mx-auto h-2 w-[86%] rounded-b-[50%] bg-[#6e747b]"/>
        </motion.div>

        <motion.div initial={{x:-70,opacity:0}} animate={{x:0,opacity:1}} transition={{delay:.28,duration:.7}} className="absolute bottom-1 left-[4%] w-[17%] rotate-[-4deg]">
          <div className="aspect-[9/18] rounded-[34px] border-[8px] border-[#13161a] bg-black p-2 shadow-[0_26px_60px_rgba(0,0,0,.65)]"><div className="relative h-full rounded-[24px] bg-[linear-gradient(145deg,#0a1620,#030608)] p-4"><div className="absolute left-1/2 top-2 h-4 w-16 -translate-x-1/2 rounded-full bg-black"/><p className="mt-10 text-xs text-sky-200">Altr</p><div className="mt-6 rounded-xl bg-white/[.05] p-3 text-[10px] text-white/55">Reply sent</div></div></div>
        </motion.div>

        <motion.div initial={{x:70,opacity:0}} animate={{x:0,opacity:1}} transition={{delay:.38,duration:.7}} className="absolute bottom-4 right-[2%] w-[27%] rotate-[3deg]">
          <div className="aspect-[16/10] rounded-[18px] border-[9px] border-[#171a1f] bg-black p-3 shadow-[0_30px_70px_rgba(0,0,0,.65)]"><div className="h-full rounded-[9px] bg-[linear-gradient(145deg,#0a1620,#030608)] p-4 text-sm text-sky-200">Altr</div></div><div className="mx-auto h-16 w-4 bg-[linear-gradient(90deg,#777e86,#b8bec5,#777e86)]"/><div className="mx-auto h-3 w-32 rounded-full bg-[#8d949d]"/>
        </motion.div>
      </div>
    </motion.div>}
    <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">{[0,1,2,3].map(item=><button key={item} aria-label={`Animation step ${item+1}`} onClick={()=>setStage(item)} className={`h-2 rounded-full transition-all ${stage===item?"w-9 bg-sky-300":"w-2 bg-white/20"}`}/>)}</div>
  </div>;
}
