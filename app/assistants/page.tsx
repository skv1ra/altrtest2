"use client";

import { ArrowLeft, Bot, BrainCircuit, Clock3, LockKeyhole, PenLine } from "lucide-react";
import Link from "next/link";
import { AiMark } from "@/components/Navigation";

const cards = [
  { name: "Altr Twin", status: "MVP ACTIVE", icon: BrainCircuit, body: "Learns from approved conversation imports, shows transparent memory sources, and creates draft-only replies in your tone." },
  { name: "Operator", status: "COMING LATER", icon: Clock3, body: "Future workflow assistant. Disabled until integrations, permission boundaries, and audit controls are production-ready." },
  { name: "Negotiator", status: "COMING LATER", icon: LockKeyhole, body: "Future sales/negotiation assistant. Preview only. It cannot send messages, negotiate, or act autonomously." },
];

export default function AssistantsPage() {
  return <main className="relative min-h-screen overflow-hidden bg-[#05080c] text-white">
    <div className="account-grid pointer-events-none fixed inset-0 opacity-55"/><div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_75%_4%,rgba(47,160,255,.13),transparent_30%),radial-gradient(circle_at_10%_55%,rgba(103,232,249,.045),transparent_28%)]"/>
    <header className="relative z-30 mx-auto flex h-24 max-w-7xl items-center justify-between px-5"><Link href="/" className="flex items-center gap-2 font-semibold">Altr <AiMark/></Link><Link href="/dashboard" className="inline-flex items-center gap-2 text-xs uppercase tracking-[.15em] text-white/40"><ArrowLeft className="h-4 w-4"/>Dashboard</Link></header>
    <div className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-10">
      <section className="grid min-h-[520px] items-center gap-10 lg:grid-cols-[1.05fr_.95fr]"><div><p className="eyebrow flex items-center gap-3"><span>ALTR TWIN</span><AiMark/><span>DRAFT ONLY</span></p><h1 className="mt-7 text-balance text-6xl font-medium leading-[.94] tracking-[-.075em] md:text-8xl">One real twin first.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-white/44 md:text-xl">The first production product is Altr Twin: transparent memory, source references, and useful draft replies. Operator and Negotiator stay as clearly labelled previews.</p><div className="mt-9 flex flex-wrap items-center gap-3"><Link href="/dashboard" className="future-button inline-flex items-center gap-3 rounded-full px-6 py-4 text-sm"><PenLine className="h-4 w-4"/>Generate draft</Link><Link href="/memory" className="glass-button inline-flex items-center gap-3 rounded-full px-6 py-4 text-sm">Open memory</Link></div></div><div className="assistant-hero-system"><span className="assistant-core"><Bot className="h-7 w-7"/></span><div className="absolute inset-6 rounded-full border border-cyan-100/[.08]"/><div className="absolute inset-20 rounded-full border border-cyan-100/[.05]"/><div className="absolute bottom-5 left-5 flex items-center gap-2 text-[9px] uppercase tracking-[.16em] text-white/25"><Bot className="h-3.5 w-3.5"/>preview slots disabled</div></div></section>
      <section className="pt-12"><div className="mb-7"><p className="data-label">ASSISTANT SLOTS</p><h2 className="mt-3 text-3xl font-medium tracking-[-.045em]">Product state</h2></div><div className="grid gap-4 lg:grid-cols-3">{cards.map(({ name, status, icon: Icon, body }) => <article key={name} className="future-card rounded-[2rem] p-7"><div className="flex items-start justify-between gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-100/[.1] bg-cyan-200/[.04]"><Icon className="h-5 w-5 text-cyan-100/60"/></span><span className="rounded-full border border-cyan-100/[.1] px-3 py-1 text-[10px] uppercase tracking-[.18em] text-cyan-50/55">{status}</span></div><h3 className="mt-7 text-2xl font-medium tracking-[-.04em]">{name}</h3><p className="mt-3 text-sm leading-6 text-white/38">{body}</p></article>)}</div></section>
    </div>
  </main>;
}
