"use client";

import { ArrowLeft, Bot, ChevronDown, Cpu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AiMark } from "@/components/Navigation";
import { AssistantCard } from "@/components/assistants/AssistantCard";
import { AssistantConfigPanel } from "@/components/assistants/AssistantConfigPanel";
import { AssistantMatrix } from "@/components/assistants/AssistantMatrix";
import { AssistantPreview } from "@/components/assistants/AssistantPreview";
import { ControlLayer } from "@/components/assistants/ControlLayer";
import { assistantsCopy } from "@/components/assistants/copy";
import { AssistantConfig, AssistantsLang } from "@/components/assistants/types";
import { initialAssistants } from "@/lib/assistantData";

export default function AssistantsPage() {
  const [lang,setLang]=useState<AssistantsLang>("EN"); const [assistants,setAssistants]=useState<AssistantConfig[]>(initialAssistants); const [selectedId,setSelectedId]=useState(initialAssistants[0].id); const t=assistantsCopy[lang];
  const selected=assistants.find(item=>item.id===selectedId)??assistants[0];
  const configure=(id:string)=>{setSelectedId(id);window.setTimeout(()=>document.getElementById("assistant-config")?.scrollIntoView({behavior:"smooth",block:"start"}),80)};
  const save=(value:AssistantConfig)=>setAssistants(current=>current.map(item=>item.id===value.id?value:item));
  const reset=()=>{const original=initialAssistants.find(item=>item.id===selectedId);if(original)setAssistants(current=>current.map(item=>item.id===selectedId?{...original,memoryAccess:[...original.memoryAccess],tasks:[...original.tasks],boundaries:[...original.boundaries],dataSources:[...original.dataSources]}:item))};

  return <main className="relative min-h-screen overflow-hidden bg-[#05080c] text-white">
    <div className="account-grid pointer-events-none fixed inset-0 opacity-55"/><div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_75%_4%,rgba(47,160,255,.13),transparent_30%),radial-gradient(circle_at_10%_55%,rgba(103,232,249,.045),transparent_28%)]"/>
    <header className="relative z-30 mx-auto flex h-24 max-w-7xl items-center justify-between px-5"><Link href="/" className="flex items-center gap-2 font-semibold">Altr <AiMark/></Link><div className="flex items-center gap-4"><div className="flex items-center gap-2 text-xs tracking-[.08em]"><button onClick={()=>setLang("EN")} className={lang==="EN"?"text-cyan-100":"text-white/30"}>EN</button><span className="text-white/15">/</span><button onClick={()=>setLang("UA")} className={lang==="UA"?"text-cyan-100":"text-white/30"}>UA</button></div><Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[.15em] text-white/40"><ArrowLeft className="h-4 w-4"/>{lang==="EN"?"Home":"Головна"}</Link></div></header>

    <div className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-10">
      <section className="grid min-h-[560px] items-center gap-10 lg:grid-cols-[1.05fr_.95fr]"><div><p className="eyebrow flex items-center gap-3"><span>ALTR WORKFORCE</span><AiMark/><span>3 ACTIVE SLOTS</span></p><h1 className="mt-7 text-balance text-6xl font-medium leading-[.94] tracking-[-.075em] md:text-8xl">{t.hero}</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-white/44 md:text-xl">{t.subtitle}</p><div className="mt-9 flex flex-wrap items-center gap-3"><button onClick={()=>configure(selectedId)} className="future-button inline-flex items-center gap-3 rounded-full px-6 py-4 text-sm">{t.configure}<ChevronDown className="h-4 w-4"/></button><span className="inline-flex items-center gap-2 rounded-full border border-cyan-100/[.09] bg-white/[.025] px-4 py-3 text-xs text-cyan-100/48"><span className="status-dot-css"/>{t.available}</span></div></div><div className="assistant-hero-system"><div className="assistant-orbit assistant-orbit-one"/><div className="assistant-orbit assistant-orbit-two"/><span className="assistant-core"><Cpu className="h-7 w-7"/></span>{assistants.map((assistant,index)=><button key={assistant.id} onClick={()=>configure(assistant.id)} className={`assistant-hero-node assistant-hero-node-${index+1}`}><span>{String(index+1).padStart(2,"0")}</span><strong>{assistant.name}</strong><small>{assistant.status}</small></button>)}<div className="absolute bottom-5 left-5 flex items-center gap-2 text-[9px] uppercase tracking-[.16em] text-white/25"><Bot className="h-3.5 w-3.5"/>distributed assistant layer</div></div></section>

      <section className="pt-12"><div className="mb-7 flex items-end justify-between gap-5"><div><p className="data-label">ASSISTANT SLOTS</p><h2 className="mt-3 text-3xl font-medium tracking-[-.045em]">{lang==="EN"?"Your three operators":"Твої три асистенти"}</h2></div><p className="hidden max-w-sm text-right text-xs leading-5 text-white/28 sm:block">{lang==="EN"?"One digital twin. Two configurable AI workers.":"Один цифровий двійник. Два кастомні AI-працівники."}</p></div><div className="grid gap-4 lg:grid-cols-3">{assistants.map(assistant=><AssistantCard key={assistant.id} assistant={assistant} lang={lang} selected={assistant.id===selectedId} onConfigure={()=>configure(assistant.id)}/>)}</div></section>

      <div className="pt-6"><AssistantConfigPanel assistant={selected} lang={lang} onSave={save} onReset={reset}/></div>
      <div className="py-24"><AssistantMatrix assistants={assistants} lang={lang}/></div>
      <AssistantPreview assistants={assistants} lang={lang}/>
      <div className="pt-24"><ControlLayer lang={lang}/></div>
    </div>
  </main>;
}
