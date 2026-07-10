import { Check, Minus } from "lucide-react";
import { assistantsCopy } from "./copy";
import { AssistantConfig, AssistantsLang } from "./types";

type Level = true | false | "limited";
const rows: { en:string; ua:string; values:[Level,Level,Level] }[] = [
  { en:"Writes replies",ua:"Пише відповіді",values:[true,"limited",true] },{ en:"Drafts emails",ua:"Готує email",values:[true,true,true] },{ en:"Summarizes chats",ua:"Підсумовує чати",values:["limited",true,"limited"] },{ en:"Tracks tasks",ua:"Стежить за задачами",values:[false,true,"limited"] },{ en:"Uses memory",ua:"Використовує памʼять",values:[true,"limited","limited"] },{ en:"Makes decisions",ua:"Готує рішення",values:["limited","limited",true] },{ en:"Can act autonomously",ua:"Може діяти автономно",values:["limited",true,"limited"] },{ en:"Can copy user style",ua:"Копіює стиль користувача",values:[true,false,"limited"] },
];
export function AssistantMatrix({ assistants, lang }: { assistants: AssistantConfig[]; lang: AssistantsLang }) {
  const t=assistantsCopy[lang];
  return <section><p className="eyebrow">CAPABILITY MATRIX</p><h2 className="mt-4 text-4xl font-medium tracking-[-.055em] md:text-6xl">{t.assign}</h2><p className="mt-4 max-w-2xl leading-7 text-white/38">{t.assignSub}</p><div className="assistant-matrix-wrap mt-8"><table className="assistant-matrix"><thead><tr><th>{lang==="EN"?"Capability":"Можливість"}</th>{assistants.map(assistant=><th key={assistant.id}>{assistant.name}<small>{assistant.type==="personal_twin"?t.twinType:t.customType}</small></th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.en}><td>{lang==="EN"?row.en:row.ua}</td>{row.values.map((value,index)=><td key={index}>{value===true?<span className="matrix-yes"><Check /></span>:value==="limited"?<span className="matrix-limited">{lang==="EN"?"Limited":"Обмежено"}</span>:<span className="matrix-no"><Minus /></span>}</td>)}</tr>)}</tbody></table></div></section>;
}
