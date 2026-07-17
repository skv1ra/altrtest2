"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentProfile } from "@/lib/auth";
import { sharedCopy } from "@/lib/i18n/copy";
import type { Lang } from "@/lib/i18n/lang-store";

export type { Lang } from "@/lib/i18n/lang-store";
export function AiMark(){return <span aria-hidden="true" className="ai-core-dot"/>;}

export function Navigation({lang,setLang}:{lang:Lang;setLang:(lang:Lang)=>void}){
 const t=sharedCopy[lang].nav; const pathname=usePathname(); const reduced=useReducedMotion();
 const [open,setOpen]=useState(false); const [signedIn,setSignedIn]=useState(false); const trigger=useRef<HTMLButtonElement>(null); const panel=useRef<HTMLDivElement>(null);
 const close=useCallback(()=>{setOpen(false);window.setTimeout(()=>trigger.current?.focus(),0);},[]);
 useEffect(()=>{let active=true; const sync=()=>getCurrentProfile().then(p=>{if(active)setSignedIn(Boolean(p));}); void sync(); window.addEventListener("altr-auth-change",sync); return()=>{active=false;window.removeEventListener("altr-auth-change",sync);};},[]);
 useEffect(()=>{setOpen(false);},[pathname]);
 useEffect(()=>{if(!open)return; const previous=document.activeElement as HTMLElement; panel.current?.querySelector<HTMLElement>("a,button")?.focus(); const key=(e:KeyboardEvent)=>{if(e.key==="Escape")close(); if(e.key!=="Tab"||!panel.current)return; const items=Array.from(panel.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled])")); if(!items.length)return; const first=items[0],last=items[items.length-1]; if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}; document.addEventListener("keydown",key); document.body.style.overflow="hidden"; return()=>{document.removeEventListener("keydown",key);document.body.style.overflow="";previous?.focus();};},[open,close]);
 const links=[{href:"/#product",label:t.product},{href:"/memory",label:t.memory},{href:"/assistants",label:t.assistants},{href:"/pricing",label:t.pricing}];
 const languages=<div className="flex items-center gap-2" aria-label={t.language}>{(["EN","UA"] as Lang[]).map(code=><button type="button" key={code} aria-pressed={lang===code} onClick={()=>setLang(code)} className={lang===code?"language-link text-cyan-100":"language-link text-white/50"}>{code}</button>)}</div>;
 return <motion.header initial={reduced?false:{opacity:0,y:-12}} animate={{opacity:1,y:0}} className="fixed inset-x-0 top-0 z-50 px-4 pt-4"><nav aria-label="Primary" className="control-bar mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6"><a href="/#top" className="flex items-center gap-2 font-semibold">Altr <AiMark/></a><div className="hidden items-center gap-7 md:flex">{links.map(x=><Link key={x.href} href={x.href} className="nav-link">{x.label}</Link>)}</div><div className="flex items-center gap-3">{languages}<Link href={signedIn?"/dashboard":"/auth?mode=register"} aria-label={t.profile} className="profile-nav-button hidden sm:inline-flex"><UserRound className="h-4 w-4"/></Link><button ref={trigger} type="button" className="profile-nav-button md:hidden" aria-label={open?t.closeMenu:t.menu} aria-expanded={open} aria-controls="mobile-navigation" onClick={()=>setOpen(v=>!v)}>{open?<X className="h-5 w-5"/>:<Menu className="h-5 w-5"/>}</button></div></nav><AnimatePresence>{open&&<motion.div initial={reduced?false:{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="fixed inset-0 z-[-1] bg-black/70 px-4 pt-24 md:hidden" onMouseDown={e=>{if(e.target===e.currentTarget)close();}}><div id="mobile-navigation" ref={panel} role="dialog" aria-modal="true" aria-label={t.menu} className="mobile-menu-panel mx-auto max-w-md rounded-3xl p-4">{links.map(x=><Link key={x.href} href={x.href} onClick={close} className="mobile-menu-link">{x.label}</Link>)}</div></motion.div>}</AnimatePresence></motion.header>;
}
