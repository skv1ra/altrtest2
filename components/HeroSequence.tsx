"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Brain, Check, Mail, MessageCircle, Send } from "lucide-react";
import { useEffect, useState } from "react";

const copy = {
  EN: {
    incomingTitle: "New message",
    sender: "Daniel Kovalenko",
    message: "Did you review the updated supplier terms?",
    memoryTitle: "Al