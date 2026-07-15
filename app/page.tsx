"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { HeroOrb } from "@/components/HeroOrb";
import { InteractiveDemo } from "@/components/InteractiveDemo";
import { AiMark, Navigation } from "@/components/Navigation";
import { Reveal } from "@/components/Reveal";
import { homeCopy } from "@/lib/i18n/home-copy";
import { useLang } from "@/lib/i18n/lang-store";

function PrimaryButton({ children }: { children: React.ReactNode }) {
  return <Link href="/auth?mode=register" className="future-button group inline-flex items-center justify-center rounded-full px-6 py-4 text-sm font-medium tracking-[0.02em] text-white"><span>{children}</span><span aria-hidden="true" className="ml-3 h-1.5 w-1.5 rounded-full bg-cyan-100 shadow-[0_0_18px_rgba(125,211,252,.95)] transition duration-500 group-hover:scale-150" /></Link>;
}

function SecondaryButton({ children }: { children: React.ReactNode }) {
  return <a href="#how" className="glass-button inline-flex items-center justify-center rounded-full px-6 py-4 text-sm font-medium text-white/70">{children}</a>;
}

export default function Home() {
  const [lang, setLang] = useLang("UA");
  const reducedMotion = useReducedMotion();
  const t = homeCopy[lang];
  const socialLinks = [
    { label: "X", url: process.env.NEXT_PUBLIC_X_URL },
    { label: "GitHub", url: process.env.NEXT_PUBLIC_GITHUB_URL },
  ].filter((item): item is { label: string; url: string } => Boolean(item.url));
  const enter = reducedMotion ? {} : { initial: { opacity: 0, y: 18, filter: "blur(8px)" }, animate: { opacity: 1, y: 0, filter: "blur(0px)" } };

  return (
    <main id="top" className="relative min-h-screen overflow-hidden bg-[#05080c] text-white selection:bg-cyan-200 selection:text-black">
      <Navigation lang={lang} setLang={setLang} />
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true"><div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_15%,rgba(55,153,255,.13),transparent_31%),radial-gradient(circle_at_18%_46%,rgba(125,211,252,.055),transparent_30%),linear-gradient(180deg,#05080c_0%,#070b12_48%,#030407_100%)]" /><div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(135,206,250,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(135,206,250,.08)_1px,transparent_1px)] [background-size:96px_96px]" /></div>

      <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 pb-20 pt-32 lg:grid-cols-[1fr_.95fr] lg:pt-28">
        <div className="max-w-3xl">
          <motion.p {...enter} transition={{ duration: .7 }} className="eyebrow mb-7 flex items-center gap-3"><span>ALTR OS</span><AiMark /><span>{t.eyebrow}</span></motion.p>
          <motion.h1 {...enter} transition={{ duration: .85 }} className="hero-gradient-sweep text-balance text-5xl font-medium leading-[0.96] tracking-[-0.072em] md:text-7xl lg:text-[6.7rem]">{t.heroTitle}</motion.h1>
          <motion.p {...enter} transition={{ duration: .7, delay: reducedMotion ? 0 : .1 }} className="mt-8 max-w-2xl text-lg leading-8 tracking-[-0.02em] text-white/64 md:text-xl">{t.heroSubtitle}</motion.p>
          <motion.div {...enter} transition={{ duration: .7, delay: reducedMotion ? 0 : .16 }} className="mt-10 flex flex-col gap-3 sm:flex-row"><PrimaryButton>{t.cta}</PrimaryButton><SecondaryButton>{t.secondary}</SecondaryButton></motion.div>
          <motion.div {...enter} transition={{ duration: .7, delay: reducedMotion ? 0 : .22 }} className="mt-12 grid max-w-2xl grid-cols-1 gap-3 text-xs uppercase tracking-[0.18em] text-white/48 sm:grid-cols-3">{[t.statA,t.statB,t.statC].map((stat)=><div key={stat} className="micro-panel"><span className="status-dot-css" />{stat}</div>)}</motion.div>
        </div>
        <HeroOrb />
      </section>

      <InteractiveDemo lang={lang} />

      <section id="how" className="relative z-10 mx-auto max-w-7xl px-5 py-16 md:py-24">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end"><Reveal><h2 className="max-w-2xl text-4xl font-medium leading-tight tracking-[-0.055em] md:text-6xl">{t.featureTitle}</h2></Reveal><Reveal delay={.05}><p className="max-w-sm text-sm leading-7 text-white/52">{t.featureBody}</p></Reveal></div>
        <div className="grid gap-4 md:grid-cols-3">{t.cards.map(([title,subtitle,body],index)=><Reveal key={title} delay={index*.04}><article className="future-card group min-h-[310px] rounded-[2rem] p-7 md:p-8"><div className="mb-14 flex items-center justify-between"><span className="data-label">SYS 0{index+1}</span><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-cyan-100/35" /></div><h3 id={index===1?"memory":index===2?"vision":undefined} className="mb-4 text-2xl font-medium tracking-[-0.04em]">{title}</h3><p className="mb-5 text-lg text-cyan-50/78">{subtitle}</p><p className="max-w-sm leading-7 text-white/52">{body}</p>{index===1&&<Link href="/memory" className="mt-7 inline-flex text-xs uppercase tracking-[.14em] text-cyan-100/70">{t.openMemory} →</Link>}{index===2&&<Link href="/assistants" className="mt-7 inline-flex text-xs uppercase tracking-[.14em] text-cyan-100/70">{t.openAssistants} →</Link>}</article></Reveal>)}</div>
        <div className="mt-4 grid gap-4 md:grid-cols-6">{t.features.map((feature,index)=><Reveal key={feature} delay={index*.025}><div className="data-chip"><span className="status-dot-css" />{feature}</div></Reveal>)}</div>
      </section>

      <section className="relative z-10 overflow-hidden px-5 py-20 md:py-28"><div className="relative mx-auto grid max-w-7xl items-center gap-8 rounded-[2.6rem] border border-cyan-200/[0.08] bg-white/[0.025] p-6 shadow-[0_28px_100px_rgba(0,0,0,.54)] backdrop-blur-md md:p-12 lg:grid-cols-[.9fr_1.1fr]"><div className="order-2 lg:order-1"><HeroOrb quiet /></div><Reveal className="order-1 lg:order-2"><p className="eyebrow mb-5">{t.finalEyebrow}</p><h2 className="text-balance text-5xl font-medium leading-[0.98] tracking-[-0.07em] md:text-7xl">{t.finalTitle}</h2><p className="mt-7 max-w-xl text-lg leading-8 text-white/58 md:text-xl">{t.finalSubtitle}</p><div className="mt-9"><PrimaryButton>{t.cta}</PrimaryButton></div></Reveal></div></section>

      <footer className="relative z-10 border-t border-cyan-100/[0.07] px-5 py-10"><div className="mx-auto grid max-w-7xl gap-9 md:grid-cols-[1.1fr_1.4fr_.8fr] md:items-start"><div><a href="#top" className="flex items-center gap-2 text-sm font-semibold"><span>Altr</span><AiMark /></a><div className="mt-10 inline-flex items-center gap-2 rounded-full border border-cyan-100/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-white/52"><span className="status-dot-css" />{t.footer.status}</div></div><nav aria-label="Footer" className="grid grid-cols-2 gap-4 text-sm text-white/48 sm:grid-cols-4"><a className="footer-link" href="#product">{t.footer.product}</a><a className="footer-link" href="#how">{t.footer.how}</a><Link className="footer-link" href="/memory">{t.footer.memory}</Link><a className="footer-link" href="#vision">{t.footer.vision}</a>{socialLinks.map((item)=><a key={item.label} className="footer-link" href={item.url} rel="noreferrer" target="_blank">{item.label}</a>)}<Link className="footer-link" href="/privacy">{t.footer.privacy}</Link><Link className="footer-link" href="/terms">{t.footer.terms}</Link><Link className="footer-link" href="/cookies">{t.footer.cookies}</Link><Link className="footer-link" href="/data-deletion">{t.footer.deletion}</Link></nav><p className="text-sm text-white/38 md:text-right">© 2026 Altr</p></div></footer>
    </main>
  );
}
