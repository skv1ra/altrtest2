"use client";

import { motion } from "framer-motion";
import { Bot, BrainCircuit, CreditCard, Database, Home, LogOut, Save, Settings2, ShieldCheck, Sparkles, Trash2, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { AiMark } from "@/components/Navigation";
import { AltrProfile, deleteCurrentAccount, getCurrentProfile, PlanId, sign