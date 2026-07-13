"use client";

import { Check, Cookie, Database, Download, FileText, MessageSquareText, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { type AltrProfile, updateCurrentProfile } from "@/lib/auth";
import { useLang } from "@/lib/i18n/lang-store";
import { get