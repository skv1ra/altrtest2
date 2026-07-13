"use client";

import { ArrowLeft, Check, FileDown, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AiMark } from "@/components/Navigation";
import { LanguageSwitch } from "@/components/legal/LanguageSwitch";
import { getCurrentProfile, type AltrProfile } from "@/lib/auth";
import { getStoredLanguage, type Lang } from "@/lib/i18