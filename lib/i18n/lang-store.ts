"use client";
import {useEffect,useState} from "react";
export type Lang="EN"|"UA";
export const LANGUAGE_STORAGE_KEY="altr_language_v1";
export const DEFAULT_LANGUAGE:Lang="EN";
export function getStoredLanguage():Lang{if(typeof window==="undefined")return DEFAULT_LANGUAGE;try{return localStorage.getItem(LANGUAGE_STORAGE_KEY)==="UA"?"UA":"EN"}catch{return DEFAULT_LANGUAGE}}
export function setStoredLanguage(lang:Lang){if(typeof window==="undefined")return;try{localStorage.setItem(LANGUAGE_STORAGE_KEY,lang)}catch{}document.documentElement.lang=lang==="UA"?"uk":"en";window.dispatchEvent(new CustomEvent<Lang>("altr-language-change",{detail:lang}))}
export function useLang(initial:Lang=DEFAULT_LANGUAGE){const[lang,setLangState]=useState<Lang>(initial);useEffect(()=>{const stored=getStoredLanguage();setLangState(stored);document.documentElement.lang=stored==="UA"?"uk":"en";const sync=(event:Event)=>{const next=(event as CustomEvent<Lang>).detail??getStoredLanguage();setLangState(next);document.documentElement.lang=next==="UA"?"uk":"en"};addEventListener("altr-language-change",sync);return()=>removeEventListener("altr-language-change",sync)},[]);const setLang=(next:Lang)=>{setLangState(next);setStoredLanguage(next)};return[lang,setLang]as const}
