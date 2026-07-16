"use client";
import {usePathname} from "next/navigation";
import {useLang,type Lang} from "@/lib/i18n/lang-store";
export function GlobalLanguageSwitch(){const pathname=usePathname();const[lang,setLang]=useLang();if(pathname==="/")return null;return <div className="fixed right-5 top-5 z-[80] flex items-center gap-2 rounded-full border border-sky-200/10 bg-[#071019]/80 px-4 py-3 text-sm shadow-[0_18px_60px_rgba(0,0,0,.42)] backdrop-blur-2xl" aria-label="Language">{(["EN","UA"] as Lang[]).map(code=><button key={code} type="button" onClick={()=>setLang(code)} aria-pressed={lang===code} className={`transition ${lang===code?"text-sky-100":"text-white/35 hover:text-white/70"}`}>{code}</button>)}</div>}
