"use client";

import { ArrowRight, Bot, Sparkles } from "lucide-react";
import { useState } from "react";
import { assistantsCopy } from "./copy";
import { AssistantConfig, AssistantsLang } from "./types";

const outputs = {
  EN: {
    assistant_twin: "Yes. I’ll send the final price and timeline today. I’m checking the final details now and will get back to you shortly.",
    assistant_operator: "Task created: confirm final price, check delivery timeline, prepare client response, send update today.",
    assistant_negotiator: "I can send the final price and delivery timeline today. Before confirming, I’m checking the final cost and available delivery options to make sure the offer is accurate.",
  },
  UA: {
    assistant_twin: "Так. Я надішлю фінальну ціну й терміни сьогодні. Зараз перевіряю останні деталі та скоро повернуся з відповіддю.",
    assistant_operator: "Задачу створено: підтвердити фінальну ціну, перевірити терміни доставки, підготувати відповідь клієнту та надіслати оновлення сьогодні.",
    assistant_negotiator: "Я можу надіслати фінальну ціну й терміни доставки сьогодні. Перед підтвердженням перевіряю остаточну вартість і доступні варіанти доставки, щоб пропозиція була точною.",
  },
} as const;

export function AssistantPreview({ assistants, lang }: { assistants: AssistantConfig[]; lang: AssistantsLang }) {
  const t=assistantsCopy[lang]; const [selected,setSelected]=useState(assistants[0].id); const [input,setInput]=useState(""); const [output,setOutput]=useState(""); const [loading,setLoading]=useState(false);
  const generate=()=>{setLoading(true);setOutput("");window.setTimeout(()=>{const key=selected as keyof typeof outputs.EN;setOutput(outputs[lang][key]);setLoading(false)},520)};
  return <section className="assistant-preview"><div><p className="eyebrow">BEHAVIOR SIMULATION</p><h2 className="mt-4 text-4xl font-medium tracking-[-.055em] md:text-6xl">{t.preview}</h2><p className="mt-4 max-w-xl text-sm leading-7 text-white/36">{lang==="EN"?"Frontend-only simulation. Compare how each assistant interprets the same request.":"Локальна симуляція без реального AI. Порівняй, як кожен асистент трактує однаковий запит."}</p></div><div className="mt-8 grid gap-4 lg:grid-cols-2"><div className="assistant-preview-input"><div className="flex gap-2 overflow-x-auto">{assistants.map(assistant=><button key={assistant.id} onClick={()=>{setSelected(assistant.id);setOutput("")}} className={selected===assistant.id?"assistant-preview-tab-active":""}>{assistant.name}</button>)}</div><textarea value={input} onChange={e=>setInput(e.target.value)} rows={6} placeholder={t.inputPlaceholder} /><button onClick={generate} className="future-button mt-4 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm"><Sparkles className="h-4 w-4" />{loading?(lang==="EN"?"Generating…":"Створення…"):t.generate}</button></div><div className="assistant-preview-output"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-100/[.1] bg-cyan-200/[.04]"><Bot className="h-5 w-5 text-cyan-100/55" /></span><div><p className="text-sm font-medium">{assistants.find(item=>item.id===selected)?.name}</p><p className="mt-1 text-[9px] uppercase tracking-[.14em] text-cyan-100/40">Simulated output</p></div></div><div className="mt-7 min-h-[150px] text-sm leading-7 text-white/55">{loading?<div className="typing-dots flex h-8 items-center gap-1.5"><span/><span/><span/></div>:output?<p>{output}</p>:<div className="flex h-[130px] items-center justify-center text-center text-white/22"><span>{lang==="EN"?"Your generated draft will appear here":"Створена чернетка зʼявиться тут"}</span><ArrowRight className="ml-2 h-4 w-4" /></div>}</div></div></div></section>;
}
