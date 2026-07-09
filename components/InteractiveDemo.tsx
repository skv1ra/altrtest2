"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Send } from "lucide-react";
import { useMemo, useState } from "react";

const examples = [
  "Can you reply to Denis about the meeting?",
  "Tell the supplier I need the invoice today.",
  "Move my call if I sound overloaded."
];

function createReply(input: string) {
  const lower = input.toLowerCase();
  if (lower.includes("invoice") || lower.includes("supplier")) {
    return "Sure. I’ll write it in your direct style: short, polite, and focused on getting the invoice today without sounding pushy.";
  }
  if (lower.includes("meeting") || lower.includes("denis")) {
    return "I’ll answer Denis like you: clear, friendly, no extra words. I’ll confirm the meeting and ask for the exact time.";
  }
  if (lower.includes("call") || lower.includes("overloaded")) {
    return "I noticed your calendar is packed. I’d suggest moving the call and sending a calm explanation in your tone.";
  }
  return "I understand the context. I’ll respond in your tone, keep it concise, and make the decision the way you usually would.";
}

export function InteractiveDemo() {
  const [message, setMessage] = useState(examples[0]);
  const [submitted, setSubmitted] = useState(examples[0]);
  const [typing, setTyping] = useState(false);
  const reply = useMemo(() => createReply(submitted), [submitted]);

  function submit() {
    if (!message.trim()) return;
    setSubmitted(message.trim());
    setTyping(true);
    window.setTimeout(() => setTyping(false), 1150);
  }

  return (
    <div id="demo" className="mx-auto max-w-6xl px-4 py-28">
      <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="mb-3 text-sm uppercase tracking-[0.32em] text-white/38">Interactive Demo</p>
          <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-white md:text-7xl">Watch Altr become your voice.</h2>
        </div>
        <p className="max-w-sm text-base leading-7 text-white/54">Type a situation. Altr mirrors your communication logic and prepares the response as your digital self.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <motion.div whileHover={{ y: -4 }} className="glass rounded-[2rem] p-5 md:p-7">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm font-medium text-white">You</span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/42">Human intent</span>
          </div>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-44 w-full resize-none rounded-3xl border border-white/10 bg-black/35 p-5 text-lg leading-8 text-white outline-none transition placeholder:text-white/25 focus:border-white/25 focus:bg-white/[0.04]"
            placeholder="Write what you need Altr to handle..."
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {examples.map((example) => (
              <button key={example} onClick={() => setMessage(example)} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/48 transition hover:border-white/25 hover:text-white">
                {example}
              </button>
            ))}
          </div>
          <button onClick={submit} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-4 font-medium text-ink transition hover:scale-[1.015]">
            Send to Altr <Send className="h-4 w-4" />
          </button>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="glass relative overflow-hidden rounded-[2rem] p-5 md:p-7">
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm font-medium text-white">Altr</span>
            <span className="rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1 text-xs text-blue-100/70">Personality model</span>
          </div>
          <div className="min-h-44 rounded-3xl border border-white/10 bg-black/35 p-5 text-lg leading-8 text-white/82">
            <AnimatePresence mode="wait">
              {typing ? (
                <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 pt-2">
                  {[0, 1, 2].map((dot) => (
                    <motion.span key={dot} animate={{ y: [0, -7, 0], opacity: [.35, 1, .35] }} transition={{ duration: .75, delay: dot * .12, repeat: Infinity }} className="h-2 w-2 rounded-full bg-white" />
                  ))}
                </motion.div>
              ) : (
                <motion.p key={reply} initial={{ opacity: 0, y: 12, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0 }} transition={{ duration: .5 }}>
                  {reply}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs text-white/40">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">Tone matched</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">Context aware</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">Decision ready</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
