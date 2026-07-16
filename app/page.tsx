"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, ChevronDown, Pause, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AiMark, Navigation } from "@/components/Navigation";
import { homeCopy } from "@/lib/i18n/home-copy";
import { useLang } from "@/lib/i18n/lang-store";

const demoCopy = {
  EN: {
    incoming: "Did you check the revised supplier terms? We need your final answer today.",
    person: "Daniel Kovalenko",
    relation: "Supplier · 2 years",
    draft: "Yes. I reviewed the revised terms. I’ll send you the final decision today before 18:00.",
    signals: ["PERSON IDENTIFIED", "CONTEXT RESTORED", "FINANCIAL TOPIC", "APPROVAL REQUIRED"],
    memories: ["Pricing discussed 12 days ago", "Updated terms received Monday", "Decision promised today"],
    approve: "Approve", edit: "Edit", ignore: "Ignore",
  },
  UA: {
    incoming: "Ти перевірив оновлені умови постачальника? Нам потрібна фінальна відповідь сьогодні.",
    person: "Daniel Kovalenko",
    relation: "Постачальник · 2 роки",
    draft: "Так. Я переглянув оновлені умови. Сьогодні до 18:00 надішлю фінальне рішення.",
    signals: ["ЛЮДИНУ ВИЗНАЧЕНО", "КОНТЕКСТ ВІДНОВЛЕНО", "ФІНАНСОВА ТЕМА", "ПОТРІБНЕ ПІДТВЕРДЖЕННЯ"],
    memories: ["Ціну обговорювали 12 днів тому", "Нові умови отримано в понеділок", "Рішення обіцяно сьогодні"],
    approve: "Підтвердити", edit: "Редагувати", ignore: "Ігнорувати",
  },
} as const;

function SystemDemo({ lang }: { lang: "EN" | "UA" }) {
  const d = demoCopy[lang];
  return <div className="overflow-hidden border border-sky-200/15 bg-[linear-gradient(145deg,rgba(12,24,36,.96),rgba(3,6,10,.98))] shadow-[0_40px_140px_rgba(0,0,0,.68),0_0_75px_rgba(56,189,248,.08)]">
    <div className="flex min-h-14 items-center justify-between border-b border-sky-200/10 px-5 font-mono text-[9px] uppercase tracking-[.18em] text-white/35"><span className="flex items-center gap-2 text-sky-100/70"><AiMark/>ALTR / ACTIVE</span><span>WAITING FOR DECISION</span></div>
    <div className="grid md:grid-cols-[.88fr_1.12fr]">
      <div className="border-b border-sky-200/10 p-6 md:border-b-0 md:border-r">
        <p className="font-mono text-[9px] tracking-[.18em] text-sky-100/35">INCOMING / 09:42</p>
        <div className="mt-6 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center border border-sky-200/25 text-xs text-sky-100">DK</span><div><strong className="block text-sm font-medium">{d.person}</strong><span className="mt-1 block text-[10px] text-white/35">{d.relation}</span></div></div>
        <p className="mt-7 border-l-2 border-sky-300 bg-sky-300/[.045] p-4 text-sm leading-7 text-white/75">{d.incoming}</p>
      </div>
      <div className="p-6">
        <p className="font-mono text-[9px] tracking-[.18em] text-sky-100/35">ALTR CONTEXT ENGINE</p>
        <div className="mt-5 grid gap-2">{d.signals.map((x,i)=><motion.div key={x} initial={{opacity:.2,x:8}} animate={{opacity:1,x:0}} transition={{delay:.3+i*.18}} className="flex items-center gap-2 font-mono text-[9px] tracking-[.12em] text-sky-100/55"><i className="h-1.5 w-1.5 bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,.9)]"/>{x}</motion.div>)}</div>
        <div className="mt-6 grid gap-2">{d.memories.map((x,i)=><div key={x} className="flex gap-3 border border-sky-200/[.08] bg-white/[.02] px-3 py-2.5 text-[11px] text-white/50"><span className="font-mono text-[9px] text-sky-300">0{i+1}</span>{x}</div>)}</div>
      </div>
    </div>
    <div className="border-t border-sky-200/10 bg-sky-300/[.025] p-5"><div className="flex justify-between font-mono text-[9px] tracking-[.15em] text-white/35"><span>ALTR DRAFT</span><span>CONFIDENCE 92%</span></div><p className="mt-4 min-h-14 text-sm leading-7 text-white/80">{d.draft}</p><div className="mt-4 flex flex-wrap gap-2"><button className="inline-flex min-h-10 items-center gap-2 bg-sky-100 px-4 text-xs text-slate-950">{d.approve}<ArrowRight className="h-4 w-4"/></button><button className="min-h-10 border border-sky-200/10 px-4 text-xs text-white/45">{d.edit}</button><button className="min-h-10 border border-sky-200/10 px-4 text-xs text-white/45">{d.ignore}</button></div></div>
  </div>;
}

export default function Home(){
  const [lang,setLang]=useLang("UA");
  const reduced=useReducedMotion();
  const [openFaq,setOpenFaq]=useState(0);
  const t=homeCopy[lang];
  const reveal=reduced?{}:{initial:{opacity:0,y:26},whileInView:{opacity:1,y:0},viewport:{once:true,margin:"-90px"},transition:{duration:.65,ease:[.16,1,.3,1]}};
  return <main id="top" className="relative min-h-screen overflow-hidden bg-[#040609] text-white">
    <Navigation lang={lang} setLang={setLang}/>
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_78%_8%,rgba(56,189,248,.12),transparent_30%),linear-gradient(180deg,#070a0e,#030405_72%)]"/>

    <section className="relative z-10 mx-auto grid min-h-screen max-w-[1440px] items-center gap-14 px-5 pb-12 pt-36 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
      <motion.div initial={reduced?false:{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:.72}}>
        <p className="eyebrow flex items-center gap-4"><span className="border-r border-sky-200/20 pr-4 text-sky-200/70">ALTR // 01</span>{t.eyebrow}</p>
        <h1 className="mt-7 text-balance text-6xl font-medium leading-[.88] tracking-[-.075em] md:text-8xl lg:text-[7rem]">{t.heroTitle}<br/><span className="text-sky-300">{t.heroAccent}</span></h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-white/55">{t.heroSubtitle}</p>
        <div className="mt-9 flex flex-wrap gap-3"><Link href="/auth?mode=register" className="inline-flex min-h-12 items-center gap-2 bg-sky-100 px-5 text-sm text-slate-950 transition hover:-translate-y-0.5 hover:bg-white">{t.cta}<ArrowRight className="h-4 w-4"/></Link><a href="#product" className="inline-flex min-h-12 items-center border border-sky-200/15 bg-white/[.025] px-5 text-sm text-white/60">{t.secondary}</a></div>
        <p className="mt-6 flex items-center gap-2 text-xs text-white/35"><ShieldCheck className="h-4 w-4"/>{t.proof}</p>
      </motion.div>
      <motion.div initial={reduced?false:{opacity:0,y:30,scale:.98}} animate={{opacity:1,y:0,scale:1}} transition={{duration:.8,delay:.12}}><SystemDemo lang={lang}/></motion.div>
      <div className="col-span-full grid border-t border-sky-200/10 sm:grid-cols-2 lg:grid-cols-4">{t.heroMeta.map((x,i)=><span key={x} className="flex min-h-16 items-center gap-3 border-b border-r border-sky-200/[.07] px-4 text-[10px] uppercase tracking-[.1em] text-white/38"><b className="font-mono text-[9px] text-sky-300">0{i+1}</b>{x}</span>)}</div>
    </section>

    <section id="product" className="relative z-10 mx-auto max-w-7xl px-5 py-28 lg:px-8"><motion.div {...reveal} className="max-w-4xl"><p className="eyebrow"><span className="mr-4 border-r border-sky-200/20 pr-4 text-sky-200/70">ALTR // 02</span>{t.sectionEyebrow}</p><h2 className="mt-7 text-5xl font-medium leading-[.98] tracking-[-.06em] md:text-7xl">{t.sectionTitle}</h2><p className="mt-6 max-w-3xl text-base leading-8 text-white/48">{t.sectionBody}</p></motion.div><div className="mt-16 border-t border-sky-200/10">{t.features.map((f,i)=><motion.article key={f.code} {...reveal} transition={{duration:.55,delay:i*.05}} className="grid min-h-44 items-center gap-6 border-b border-sky-200/10 py-7 md:grid-cols-[70px_1fr_190px]"><span className="font-mono text-xs text-sky-300">{f.code}</span><div><h3 className="text-2xl font-medium tracking-[-.035em]">{f.title}</h3><p className="mt-3 max-w-2xl leading-7 text-white/44">{f.body}</p></div><span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.12em] text-white/40"><i className="h-1.5 w-1.5 bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,.9)]"/>{f.status}</span></motion.article>)}</div></section>

    <section className="relative z-10 mx-auto max-w-7xl px-5 py-24 lg:px-8"><motion.div {...reveal} className="max-w-4xl"><p className="eyebrow"><span className="mr-4 border-r border-sky-200/20 pr-4 text-sky-200/70">ALTR // 03</span>{t.comparisonEyebrow}</p><h2 className="mt-7 text-5xl font-medium leading-[.98] tracking-[-.06em] md:text-7xl">{t.comparisonTitle}</h2><p className="mt-6 max-w-3xl leading-8 text-white/48">{t.comparisonBody}</p></motion.div><motion.div {...reveal} className="mt-14 overflow-x-auto border border-sky-200/10 bg-black/20"><div className="min-w-[760px]"><div className="grid min-h-16 grid-cols-[170px_1fr_1fr] items-center border-b border-sky-200/10 font-mono text-[9px] uppercase tracking-[.14em] text-white/35"><span/><strong className="px-5">{t.comparisonHeaders[0]}</strong><strong className="px-5">{t.comparisonHeaders[1]}</strong></div>{t.comparisonRows.map(r=><div key={r.label} className="grid min-h-20 grid-cols-[170px_1fr_1fr] items-center border-b border-sky-200/[.07] text-sm last:border-0"><strong className="px-5 text-xs font-medium text-white/70">{r.label}</strong><span className="px-5 text-white/35">{r.standard}</span><span className="flex items-center gap-2 px-5 text-sky-100/70"><Check className="h-4 w-4 text-sky-300"/>{r.altr}</span></div>)}</div></motion.div></section>

    <section id="autonomy" className="relative z-10 mx-auto max-w-7xl px-5 py-24 lg:px-8"><motion.div {...reveal} className="max-w-4xl"><p className="eyebrow"><span className="mr-4 border-r border-sky-200/20 pr-4 text-sky-200/70">ALTR // 04</span>{t.authorityEyebrow}</p><h2 className="mt-7 text-5xl font-medium leading-[.98] tracking-[-.06em] md:text-7xl">{t.authorityTitle}</h2><p className="mt-6 max-w-3xl leading-8 text-white/48">{t.authorityBody}</p></motion.div><div className="mt-14 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{t.authorityLevels.map((x,i)=><motion.article key={x.level} {...reveal} transition={{duration:.55,delay:i*.05}} className={`min-h-[300px] border p-6 ${i===1?"border-sky-300/35 bg-sky-300/[.07]":"border-sky-200/10 bg-white/[.018]"}`}><div className="flex justify-between font-mono text-[10px] text-sky-300"><span>{x.level}</span>{i===1&&<em className="not-italic tracking-[.12em] text-white/35">RECOMMENDED</em>}</div><h3 className="mt-16 text-2xl font-medium">{x.title}</h3><p className="mt-4 text-sm leading-7 text-white/42">{x.body}</p><div className="mt-8 h-px bg-white/[.07]"><i className="block h-full bg-sky-300" style={{width:`${(i+1)*25}%`}}/></div></motion.article>)}</div></section>

    <section className="relative z-10 mx-auto max-w-[1400px] px-5 py-24 lg:px-8"><motion.div {...reveal} className="grid gap-12 border border-sky-200/10 bg-[linear-gradient(145deg,rgba(10,20,29,.94),rgba(3,6,9,.96))] p-7 md:p-12 lg:grid-cols-[1fr_360px]"><div><p className="eyebrow"><span className="mr-4 border-r border-sky-200/20 pr-4 text-sky-200/70">ALTR // 05</span>{t.securityEyebrow}</p><h2 className="mt-7 text-5xl font-medium leading-[.98] tracking-[-.06em] md:text-7xl">{t.securityTitle}</h2><p className="mt-6 max-w-3xl leading-8 text-white/48">{t.securityBody}</p><div className="mt-8 flex flex-wrap gap-2">{t.securityItems.map(x=><span key={x} className="flex items-center gap-2 border border-sky-200/10 px-3 py-2 text-xs text-white/45"><Check className="h-4 w-4 text-sky-300"/>{x}</span>)}</div></div><div className="flex min-h-[330px] flex-col justify-center border border-red-300/15 bg-red-400/[.035] p-8"><span className="grid h-14 w-14 place-items-center border border-red-300/25 text-red-200"><Pause/></span><small className="mt-10 font-mono tracking-[.16em] text-red-100/35">MASTER CONTROL</small><strong className="mt-3 text-3xl font-medium">PAUSE ALTR</strong><p className="mt-3 text-xs text-red-100/35">Stop all outgoing actions immediately.</p><button className="mt-7 min-h-11 border border-red-300/25 font-mono text-[9px] tracking-[.14em] text-red-200">EMERGENCY STOP</button></div></motion.div></section>

    <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-5 py-24 lg:px-8"><motion.div {...reveal}><p className="eyebrow"><span className="mr-4 border-r border-sky-200/20 pr-4 text-sky-200/70">ALTR // 06</span>{t.pricingEyebrow}</p><h2 className="mt-7 max-w-4xl text-5xl font-medium leading-[.98] tracking-[-.06em] md:text-7xl">{t.pricingTitle}</h2></motion.div><div className="mt-14 grid gap-3 lg:grid-cols-2">{t.plans.map((p,i)=><motion.article key={p.name} {...reveal} className={`border p-8 ${i===1?"border-sky-300/35 bg-sky-300/[.06]":"border-sky-200/10 bg-white/[.018]"}`}><div className="font-mono text-[10px] uppercase tracking-[.15em] text-sky-300">{p.name}</div><div className="mt-10 flex items-end gap-3"><del className="text-white/25">{p.oldPrice}</del><strong className="text-6xl font-medium tracking-[-.06em]">{p.price}</strong><span className="mb-2 text-xs text-white/35">{p.suffix}</span></div><p className="mt-6 min-h-14 leading-7 text-white/45">{p.description}</p><ul className="mt-7 grid gap-3">{p.features.map(x=><li key={x} className="flex items-center gap-2 text-sm text-white/55"><Check className="h-4 w-4 text-sky-300"/>{x}</li>)}</ul><Link href="/pricing" className={`mt-9 flex min-h-12 items-center justify-between border px-4 text-sm ${i===1?"border-sky-100 bg-sky-100 text-slate-950":"border-sky-200/15 text-white/65"}`}>{p.cta}<ArrowRight className="h-4 w-4"/></Link></motion.article>)}</div></section>

    <section className="relative z-10 mx-auto max-w-7xl px-5 py-24 lg:px-8"><motion.div {...reveal}><p className="eyebrow"><span className="mr-4 border-r border-sky-200/20 pr-4 text-sky-200/70">ALTR // 07</span>{t.faqEyebrow}</p><h2 className="mt-7 text-5xl font-medium leading-[.98] tracking-[-.06em] md:text-7xl">{t.faqTitle}</h2></motion.div><div className="mt-14 border-t border-sky-200/10">{t.faq.map((x,i)=><button key={x.q} onClick={()=>setOpenFaq(openFaq===i?-1:i)} aria-expanded={openFaq===i} className="grid w-full grid-cols-[45px_1fr_25px] gap-4 border-b border-sky-200/10 py-6 text-left"><span className="font-mono text-[10px] text-sky-300">{String(i+1).padStart(2,"0")}</span><div><strong className="text-lg font-medium">{x.q}</strong><AnimatePresence initial={false}>{openFaq===i&&<motion.p initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden pt-4 text-sm leading-7 text-white/43">{x.a}</motion.p>}</AnimatePresence></div><ChevronDown className={`h-5 w-5 transition ${openFaq===i?"rotate-180":""}`}/></button>)}</div></section>

    <section className="relative z-10 mx-auto max-w-7xl border-t border-sky-200/10 px-5 py-28 text-center lg:px-8"><p className="eyebrow justify-center"><span className="mr-4 border-r border-sky-200/20 pr-4 text-sky-200/70">ALTR // 08</span>{t.finalEyebrow}</p><h2 className="mx-auto mt-7 max-w-5xl text-5xl font-medium leading-[.98] tracking-[-.06em] md:text-7xl">{t.finalTitle}</h2><p className="mx-auto mt-6 max-w-2xl leading-8 text-white/48">{t.finalSubtitle}</p><Link href="/auth?mode=register" className="mt-8 inline-flex min-h-12 items-center gap-2 bg-sky-100 px-5 text-sm text-slate-950">{t.cta}<ArrowRight className="h-4 w-4"/></Link></section>

    <footer className="relative z-10 mx-auto grid max-w-[1400px] gap-8 border-t border-sky-200/10 px-5 py-10 text-xs text-white/35 md:grid-cols-[1fr_2fr_auto] lg:px-8"><div><a href="#top" className="flex items-center gap-2 text-base text-white">Altr <AiMark/></a><p className="mt-5 font-mono text-[9px] tracking-[.13em]">{t.footer.status}</p></div><nav className="flex flex-wrap content-start gap-x-6 gap-y-4"><a href="#product">{t.footer.product}</a><a href="#product">{t.footer.how}</a><Link href="/memory">{t.footer.memory}</Link><a href="#autonomy">{t.footer.autonomy}</a><a href="#pricing">{t.footer.pricing}</a><Link href="/privacy">{t.footer.privacy}</Link><Link href="/terms">{t.footer.terms}</Link><Link href="/cookies">{t.footer.cookies}</Link><Link href="/data-deletion">{t.footer.deletion}</Link></nav><p>© 2026 Altr</p></footer>
  </main>;
}
