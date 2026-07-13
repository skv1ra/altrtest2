"use client";

import { AlertTriangle, ArrowLeft, Check, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AiMark } from "@/components/Navigation";
import { getCurrentProfile } from "@/lib/auth";
import { legalConfig } from "@/lib/legal";

type Scope = "all" | "account" | "conversations" | "memory";
