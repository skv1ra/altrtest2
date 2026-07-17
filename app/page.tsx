"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { HeroOrb } from "@/components/HeroOrb";
import { InteractiveDemo } from "@/components/InteractiveDemo";
import { Navigation } from "@/components/Navigation";
import { Reveal } from "@/components/Reveal";
import { homeCopy } from "@/lib/i18n/home-copy";
import { useLang } from "@/lib/i18n/lang-store";

export default function Home(){
 const [lang,setLang]=useLang("EN"); const