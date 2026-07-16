"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Brain, Check, Mail, MessageCircle, Send } from "lucide-react";
import { useEffect, useState } from "react";

const copy = {
  EN: {
    incomingTitle: "A message arrives",
    sender: "Daniel Kovalenko",
    message: "Did you review the updated supplier terms?",
    memoryTitle: "Altr remembers",
    memories: ["Pricing discussed 12 days ago", "New