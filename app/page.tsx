"use client";

import { motion } from "framer-motion";
import { Brain, CalendarClock, Check, ChevronRight, Fingerprint, GitBranch, Mail, Mic2, Network, Shield, Sparkles, Zap, type LucideIcon } from "lucide-react";
import { HeroOrb } from "@/components/HeroOrb";
import { InteractiveDemo } from "@/components/InteractiveDemo";
import { Navigation } from "@/components/Navigation";
import { Reveal } from "@/components/Reveal";

const learning = ["Learns your writing", "Learns your voice", "Learns your decisions", "Learns your routines", "Learns your memory"];
const timeline = [
  ["Week 1", "Learns how you write.", "Your tone, sentence rhythm, common replies and communication boundaries."],
  ["Month 1", "Understands your decisions.", "Altr starts recognizing patterns in how you approve, reject, prioritize and respond."],
  ["Month 6", "Can answer exactly like you.", "It handles common conversations, emails and recurring digital workflows with your permission."],
  ["Year 2", "Your digital self.", "A living personality model that knows your memory, context and way of thinking."],
];
const features: Array<[LucideIcon, string, string]> = [
  [Mic2, "Voice cloning", "Understands your vocal identity, pacing and emotional cadence."],
  [Brain, "Memory Engine", "Builds a structured long-term memory from your real context."],
  [Zap, "Autonomous Replies", "Responds to repetitive conversations with approval controls."],
  [Fingerprint, "AI Decisions", "Learns your typical decision logic and risk preferences."],
  [CalendarClock, "Calendar Understanding", "Knows your schedule, focus windows and recurring commitments."],
  [Mail, "Email Assistant", "Drafts and prioritizes email in your exact working style."],
  [GitBranch, "Knowledge Graph", "Connects people, tasks, projects and personal history."],
  [Network, "Personality Model", "Turns your behavior into a private adaptive model."],
];

export default function Home() {
  return (
    <main id="top" className="relative min-h-screen overflow-hidden bg-ink text-white">
      <Navigation />
      <div className="pointer-events-none fixed inset-0 z-0">
        <motion.div animate={{ x: [0, 80, 0], y: [0, -45, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} className="absolute left-[8%] top-[12%] h-72 w-72 rounded-full bg-blue-500/10 blur-[90px]" />
        <motion.div animate={{ x: [0, -65, 0], y: [0, 65, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} className="absolute right-[8%] top-[18%] h-96 w-96 rounded-full bg-violet-500/10 blur-[110px]" />
      </div>

      <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-14 px-4 pb-20 pt-32 lg:grid-cols-[1.05fr_.95fr] lg:pt-28">
        <div className="text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75 }} className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/62 lg:mx-0">
            <Sparkles className="h-4 w-4 text-blue-200" /> AI twin for your digital life
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24, filter: "blur(14px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="text-balance text-6xl font-semibold tracking-[-0.075em] md:text-8xl lg:text-[7.8rem] lg:leading-[.88]">
            Become impossible to replace.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .16 }} className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/58 md:text-xl lg:mx-0">
            Altr learns how you think, decide and communicate — until it becomes your digital self.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .26 }} className="mt-10 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <a href="#waitlist" className="group inline-flex items-center justify-center rounded-full bg-white px-7 py-4 font-medium text-ink transition hover:scale-[1.03]">
              Join Waitlist <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            <a href="#demo" className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-7 py-4 font-medium text-white/86 backdrop-blur-xl transition hover:border-white/24 hover:bg-white/[0.08]">
              Watch Demo
            </a>
          </motion.div>
        </div>
        <HeroOrb />
      </section>

      <section id="brain" className="relative z-10 mx-auto max-w-6xl px-4 py-24">
        <Reveal>
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm uppercase tracking-[0.32em] text-white/38">Your second brain.</p>
            <h2 className="text-4xl font-semibold tracking-[-0.05em] md:text-7xl">A model that learns you.</h2>
          </div>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-5">
          {learning.map((item, index) => (
            <Reveal key={item} delay={index * .05}>
              <motion.div whileHover={{ y: -8, scale: 1.02 }} className="group glass relative min-h-40 overflow-hidden rounded-[1.7rem] p-5">
                <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_0%,rgba(87,139,255,.22),transparent_58%)]" />
                <Check className="relative mb-8 h-5 w-5 text-blue-100" />
                <p className="relative text-lg font-medium tracking-[-0.03em] text-white/88">{item}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="timeline" className="relative z-10 mx-auto max-w-5xl px-4 py-28">
        <Reveal>
          <h2 className="mb-16 max-w-3xl text-4xl font-semibold tracking-[-0.05em] md:text-7xl">From assistant to digital self.</h2>
        </Reveal>
        <div className="relative">
          <div className="absolute left-5 top-0 h-full w-px bg-white/10 md:left-1/2" />
          <motion.div initial={{ height: 0 }} whileInView={{ height: "100%" }} viewport={{ once: true }} transition={{ duration: 1.4, ease: "easeOut" }} className="absolute left-5 top-0 w-px bg-gradient-to-b from-blue-200 via-violet-200 to-transparent md:left-1/2" />
          <div className="space-y-10">
            {timeline.map(([time, title, body], index) => (
              <Reveal key={time} delay={index * .08}>
                <div className={`relative grid gap-6 pl-14 md:grid-cols-2 md:pl-0 ${index % 2 ? "md:text-left" : "md:text-right"}`}>
                  <div className={index % 2 ? "md:col-start-2 md:pl-16" : "md:pr-16"}>
                    <div className="glass rounded-[1.8rem] p-6">
                      <p className="mb-3 text-sm text-blue-100/72">{time}</p>
                      <h3 className="mb-3 text-2xl font-semibold tracking-[-0.04em]">{title}</h3>
                      <p className="leading-7 text-white/52">{body}</p>
                    </div>
                  </div>
                  <div className="absolute left-[13px] top-8 h-4 w-4 rounded-full border border-white/40 bg-ink shadow-glow md:left-[calc(50%-7px)]" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <InteractiveDemo />

      <section className="relative z-10 mx-auto max-w-6xl px-4 py-24">
        <Reveal>
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] md:text-7xl">Everything that makes you, you.</h2>
            <p className="max-w-sm leading-7 text-white/52">Each module is private, permission-based and designed to compound over time.</p>
          </div>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map(([Icon, title, body], index) => (
            <Reveal key={String(title)} delay={index * .04}>
              <motion.article whileHover={{ y: -8 }} className="glass group relative min-h-64 overflow-hidden rounded-[2rem] p-6">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/0 blur-3xl transition group-hover:bg-blue-500/15" />
                <Icon className="mb-12 h-7 w-7 text-white/74" strokeWidth={1.2} />
                <h3 className="mb-3 text-xl font-semibold tracking-[-0.04em]">{title}</h3>
                <p className="leading-7 text-white/48">{body}</p>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="future" className="relative z-10 overflow-hidden px-4 py-32">
        <div className="ai-grid absolute inset-0 opacity-50" />
        <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
        <Reveal>
          <div className="relative mx-auto max-w-6xl text-center">
            <p className="mb-5 text-sm uppercase tracking-[0.32em] text-white/38">The Future</p>
            <h2 className="text-balance text-5xl font-semibold tracking-[-0.06em] md:text-8xl">One day your AI will know you better than anyone.</h2>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/52">Not a chatbot. Not an assistant. A private intelligence layer trained on your choices, context, relationships and memory.</p>
          </div>
        </Reveal>
      </section>

      <section id="waitlist" className="relative z-10 mx-auto max-w-5xl px-4 py-28">
        <Reveal>
          <div className="glass overflow-hidden rounded-[2.4rem] p-7 text-center md:p-14">
            <Shield className="mx-auto mb-6 h-8 w-8 text-white/70" strokeWidth={1.2} />
            <h2 className="mx-auto max-w-3xl text-4xl font-semibold tracking-[-0.05em] md:text-7xl">Start building your digital self today.</h2>
            <p className="mx-auto mt-6 max-w-xl leading-7 text-white/52">Join the private waitlist. Early users will shape how Altr learns, remembers and acts with permission.</p>
            <form className="mx-auto mt-9 flex max-w-xl flex-col gap-3 rounded-[1.7rem] border border-white/10 bg-black/30 p-2 sm:flex-row">
              <input type="email" required placeholder="you@company.com" className="min-h-14 flex-1 bg-transparent px-5 text-white outline-none placeholder:text-white/28" />
              <button className="rounded-[1.25rem] bg-white px-7 py-4 font-medium text-ink transition hover:scale-[1.02]">Join Waitlist</button>
            </form>
          </div>
        </Reveal>
      </section>

      <footer className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 border-t border-white/10 px-4 py-10 text-sm text-white/38 md:flex-row">
        <p>© 2026 Altr. Digital self infrastructure.</p>
        <div className="flex gap-5">
          {['Privacy', 'Terms', 'X', 'LinkedIn', 'GitHub'].map((item) => <a key={item} href="#" className="transition hover:text-white">{item}</a>)}
        </div>
      </footer>
    </main>
  );
}
