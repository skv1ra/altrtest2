"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export function HeroSequence({ lang }: { lang: "EN" | "UA" }) {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(reduced ? 3 : 0);
  const ua = lang === "UA";

  useEffect(() => {
    if (reduced) { setStage(3); return; }
    const timer = window.setInterval(() => setStage((value) => (value + 1) % 4), 3000);
    return () => window.clearInterval(timer);
  }, [reduced]);

  const screens = [
    <div key="message" className="mx-auto max-w-2xl rounded-[28px] border border-white/10 bg-white/[.045] p-6 md:p-9">
      <div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-full bg-sky-300/10 text-sky-200">✦</span><div><p className="text-sm text-white/35">Telegram · Daniel</p><h3 className="mt-1 text-xl font-medium md:text-2xl">{ua ? "Нове повідомлення" : "New message"}</h3></div></div>
      <p className="mt-7 rounded-[22px] bg-black/25 p-5 text-lg leading-8 text-white/80 md:text-xl">{ua ? "Ти переглянув оновлені умови постачальника?" : "Did you review the updated supplier terms?"}</p>
    </div>,
    <div key="memory" className="mx-auto max-w-3xl rounded-[28px] border border-sky-200/15 bg-sky-300/[.04] p-6 md:p-9">
      <h3 className="text-2xl font-medium">{ua ? "Altr відновлює контекст" : "Altr restores context"}</h3>
      <div className="mt-7 grid gap-3 md:grid-cols-3">{(ua ? ["Ціну обговорювали 12 днів тому", "Нові умови отримано в понеділок", "Відповідь обіцяно сьогодні"] : ["Pricing discussed 12 days ago", "New terms received Monday", "Final answer promised today"]).map((item, index) => <motion.div key={item} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:index*.18}} className="rounded-[20px] border border-white/8 bg-black/20 p-4 text-sm leading-6 text-white/60">✓ {item}</motion.div>)}</div>
    </div>,
    <div key="reply" className="mx-auto max-w-2xl rounded-[28px] border border-sky-300/25 bg-sky-300/[.07] p-6 md:p-9">
      <h3 className="text-2xl font-medium">{ua ? "Altr відповідає" : "Altr replies"}</h3>
      <p className="mt-7 rounded-[22px] bg-black/25 p-5 text-lg leading-8 text-white/85 md:text-xl">{ua ? "Так. Я переглянув умови. До 18:00 надішлю фінальне рішення." : "Yes. I reviewed the terms. I will send the final decision before 18:00."}</p>
      <motion.div animate={{x:[0,7,0]}} transition={{repeat:Infinity,duration:1.4}} className="ml-auto mt-6 w-fit rounded-full bg-sky-100 px-5 py-3 text-sm font-medium text-slate-950">{ua ? "Надіслано" : "Sent"}</motion.div>
    </div>
  ];

  return <div className="relative min-h-[560px] overflow-hidden rounded-[42px] border border-sky-200/15 bg-[radial-gradient(circle_at_center,rgba(56,189,248,.15),transparent_40%),#05090d] p-5 shadow-[0_45px_150px_rgba(0,0,0,.72)] md:min-h-[650px] md:p-10">
    {stage < 3 ? <motion.div key="tablet" initial={{opacity:0,scale:.92}} animate={{opacity:1,scale:1}} className="absolute inset-5 flex items-center justify-center md:inset-10">
      <div className="relative flex h-full max-h-[540px] w-full max-w-[980px] items-center justify-center rounded-[38px] border-[10px] border-[#17212b] bg-[#071018] p-5 shadow-[0_35px_100px_rgba(0,0,0,.7),0_0_50px_rgba(56,189,248,.08)] md:p-10"><span className="absolute left-1/2 top-2 h-2 w-2 -translate-x-1/2 rounded-full bg-white/20"/><motion.div key={stage} initial={{opacity:0,y:22,filter:"blur(10px)"}} animate={{opacity:1,y:0,filter:"blur(0px)"}} transition={{duration:.65}} className="w-full">{screens[stage]}</motion.div></div>
    </motion.div> : <motion.div key="devices" initial={{opacity:0,scale:.82}} animate={{opacity:1,scale:1}} transition={{duration:.85}} className="absolute inset-4 flex items-center justify-center md:inset-8">
      <div className="relative h-[460px] w-full max-w-[1050px]">
        <div className="absolute bottom-10 left-1/2 w-[54%] -translate-x-1/2"><div className="aspect-[16/10] rounded-[22px] border-[9px] border-[#17212b] bg-sky-300/[.08] p-5 shadow-2xl"><div className="h-full rounded-[13px] bg-[#071018] p-5 text-sky-100">Altr</div></div><div className="mx-auto h-3 w-[70%] rounded-b-xl bg-[#26313c]"/></div>
        <div className="absolute bottom-4 left-[5%] w-[18%] rotate-[-4deg]"><div className="aspect-[9/18] rounded-[28px] border-[7px] border-[#17212b] bg-[#071018] p-3 shadow-2xl"><div className="h-full rounded-[18px] bg-sky-300/[.08] p-3 text-sm text-sky-100">Altr</div></div></div>
        <div className="absolute bottom-5 right-[3%] w-[29%] rotate-[3deg]"><div className="aspect-[16/11] rounded-[16px] border-[8px] border-[#17212b] bg-[#071018] p-4 shadow-2xl"><div className="h-full rounded-[9px] bg-sky-300/[.08] p-4 text-sky-100">Altr</div></div><div className="mx-auto h-14 w-3 bg-[#26313c]"/><div className="mx-auto h-2 w-24 rounded-full bg-[#26313c]"/></div>
      </div>
    </motion.div>}
    <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">{[0,1,2,3].map((item)=><button key={item} aria-label={`Animation step ${item+1}`} onClick={()=>setStage(item)} className={`h-2 rounded-full transition-all ${stage===item?"w-9 bg-sky-300":"w-2 bg-white/20"}`}/>)}</div>
  </div>;
}
