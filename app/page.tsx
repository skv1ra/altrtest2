"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { HeroOrb } from "@/components/HeroOrb";
import { InteractiveDemo } from "@/components/InteractiveDemo";
import { AiMark, Navigation } from "@/components/Navigation";
import { Reveal } from "@/components/Reveal";
import { homeCopy } from "@/lib/i18n/home-copy";
import { useLang } from "@/lib/i18n/lang-store";

export default function Home(){
 const [lang,setLang]=useLang("UA"); const reduced=useReducedMotion(); const t=homeCopy[lang];
 const socials=[{label:"X",url:process.env.NEXT_PUBLIC_X_URL},{label:"GitHub",url:process.env.NEXT_PUBLIC_GITHUB_URL}].filter((x):x is {label:string;url:string}=>Boolean(x.url));
 const enter=reduced?{}:{initial:{opacity:0,y:18},animate:{opacity:1,y:0}};
 return <main id="top" className="relative min-h-screen overflow-hidden bg-[#05080c] text-white">
  <Navigation lang={lang} setLang={setLang}/><div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_72%_15%,rgba(55,153,255,.13),transparent_31%),linear-gradient(180deg,#05080c,#030407)]"/>
  <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 pb-20 pt-32 lg:grid-cols-[1fr_.95fr]">
   <div><motion.p {...enter} className="eyebrow mb-7 flex items-center gap-3">ALTR OS <AiMark/> {t.eyebrow}</motion.p><motion.h1 {...enter} className="hero-gradient-sweep text-balance text-5xl font-medium leading-[.96] tracking-[-.07em] md:text-7xl lg:text-[6.7rem]">{t.heroTitle}</motion.h1><p className="mt-8 max-w-2xl text-lg leading-8 text-white/64">{t.heroSubtitle}</p><div className="mt-10 flex flex-col gap-3 sm:flex-row"><Link href="/auth?mode=register" className="future-button rounded-full px-6 py-4 text-center text-sm">{t.cta}</Link><a href="#how" className="glass-button rounded-full px-6 py-4 text-center text-sm">{t.secondary}</a></div><div className="mt-12 grid gap-3 text-xs uppercase tracking-[.18em] text-white/48 sm:grid-cols-3">{[t.statA,t.statB,t.statC].map(x=><div key={x} className="micro-panel"><span className="status-dot-css"/>{x}</div>)}</div></div><HeroOrb/>
  </section>
  <InteractiveDemo lang={lang}/>
  <section id="how" className="relative z-10 mx-auto max-w-7xl px-5 py-20"><Reveal><h2 className="max-w-3xl text-4xl font-medium tracking-[-.055em] md:text-6xl">{t.featureTitle}</h2><p className="mt-5 max-w-2xl text-white/55">{t.featureBody}</p></Reveal><div className="mt-10 grid gap-4 md:grid-cols-3">{t.cards.map(([title,subtitle,body],i)=><Reveal key={title} delay={i*.04}><article className="future-card min-h-[310px] rounded-[2rem] p-7"><span className="data-label">SYS 0{i+1}</span><h3 id={i===1?"memory":i===2?"vision":undefined} className="mt-14 text-2xl">{title}</h3><p className="mt-4 text-lg text-cyan-50/78">{subtitle}</p><p className="mt-4 leading-7 text-white/52">{body}</p>{i===1&&<Link href="/memory" className="mt-7 inline-flex text-xs uppercase tracking-[.14em] text-cyan-100/70">{t.openMemory} →</Link>}{i===2&&<Link href="/assistants" className="mt-7 inline-flex text-xs uppercase tracking-[.14em] text-cyan-100/70">{t.openAssistants} →</Link>}</article></Reveal>)}</div><div className="mt-4 grid gap-4 md:grid-cols-6">{t.features.map(x=><div key={x} className="data-chip"><span className="status-dot-css"/>{x}</div>)}</div></section>
  <section className="relative z-10 px-5 py-24"><div className="mx-auto grid max-w-7xl gap-8 rounded-[2.6rem] border border-cyan-200/[.08] bg-white/[.025] p-7 md:p-12 lg:grid-cols-2"><HeroOrb quiet/><div className="self-center"><p className="eyebrow">{t.finalEyebrow}</p><h2 className="mt-5 text-5xl font-medium tracking-[-.07em] md:text-7xl">{t.finalTitle}</h2><p className="mt-7 text-lg leading-8 text-white/58">{t.finalSubtitle}</p><Link href="/auth?mode=register" className="future-button mt-9 inline-flex rounded-full px-6 py-4 text-sm">{t.cta}</Link></div></div></section>
  <footer className="relative z-10 border-t border-cyan-100/[.07] px-5 py-10"><div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3"><div><a href="#top" className="flex items-center gap-2 font-semibold">Altr <AiMark/></a><p className="mt-8 text-sm text-white/50">{t.footer.status}</p></div><nav aria-label="Footer" className="grid grid-cols-2 gap-4 text-sm text-white/50"><a href="#product">{t.footer.product}</a><a href="#how">{t.footer.how}</a><Link href="/memory">{t.footer.memory}</Link><a href="#vision">{t.footer.vision}</a>{socials.map(x=><a key={x.label} href={x.url} target="_blank" rel="noreferrer">{x.label}</a>)}<Link href="/privacy">{t.footer.privacy}</Link><Link href="/terms">{t.footer.terms}</Link><Link href="/cookies">{t.footer.cookies}</Link><Link href="/data-deletion">{t.footer.deletion}</Link></nav><p className="text-sm text-white/38 md:text-right">© 2026 Altr</p></div></footer>
 </main>;
}
