"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentProfile } from "@/lib/auth";
import { sharedCopy } from "@/lib/i18n