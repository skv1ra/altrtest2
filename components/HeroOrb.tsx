"use client";

import type { CSSProperties } from "react";

type ChatBlock = {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines: number[];
};

const chats: ChatBlock[] = [
  { x: 8, y: 13, w: 33, h: 20, title: "Client", lines: [72, 48, 62] },
  { x: 57, y: 10, w: 35, h: 22, title: "Team", lines: [54, 75, 43] },
  { x: 15, y: 61, w: 36, h: 24, title: "Email", lines: [78, 58, 68, 44] },
  { x: 61, y: 58, w: 31, h: 20, title: "Context", lines: [66, 42, 72] },
];

const paths = [
  { d: "M 36 25 C 48 20, 54 21, 66 23", duration: "9s", delay: "0s" },
  { d: "M 25 34 C 32 49, 44 58, 66 63", duration: "10.5s", delay: "-2.4s" },
  { d: "M 74 33 C 69 45, 58 53, 40 65", duration: "11s", delay: "-5.2s" },
  { d: "M 48 73 C 57 71, 62 70, 74 68", duration: "8.4s", delay: "-1.2s" },
  { d: "M 39 20 C 50 34, 53 48, 52 61", duration: "12s", delay: "-7s" },
  { d: "M 81 57 C 72 49, 62 42, 44 30", duration: "13.5s", delay: "-4.1s" },
];

function ChatBlockCard({ chat, quiet, index }: { chat: ChatBlock; quiet?: boolean; index: number }) {
  return (
    <g className={`chat-node chat-node-${index} ${quiet ? "chat-node-quiet" : ""}`}>
      <rect
        x={chat.x}
        y={chat.y}
        width={chat.w}
        height={chat.h}
        rx="3.8"
        className="chat-node-surface"
      />
      <text x={chat.x + 4.2} y={chat.y + 6.7} className="chat-node-title">
        {chat.title}
      </text>
      {chat.lines.map((line, i) => (
        <rect
          key={i}
          x={chat.x + 4.2}
          y={chat.y + 10 + i * 3.7}
          width={(chat.w - 8.4) * (line / 100)}
          height="0.72"
          rx="0.36"
          className="chat-node-line"
        />
      ))}
      <circle cx={chat.x + chat.w - 5.2} cy={chat.y + 5.2} r="0.8" className="chat-node-core" />
    </g>
  );
}

function SignalPath({ d, duration, delay, index }: { d: string; duration: string; delay: string; index: number }) {
  const motionVars = { "--signal-duration": duration, "--signal-delay": delay } as CSSProperties;

  return (
    <g className={`signal-group signal-group-${index}`} style={motionVars}>
      <path d={d} className="signal-line" pathLength="1" />
      <circle r="1.05" className="signal-particle">
        <animateMotion dur={duration} begin={delay} repeatCount="indefinite" path={d} keyPoints="0;0.34;0.38;1" keyTimes="0;0.46;0.55;1" calcMode="spline" keySplines="0.16 1 0.3 1;0.3 0 0.2 1;0.16 1 0.3 1" />
      </circle>
      <circle r="0.38" className="signal-particle signal-particle-small">
        <animateMotion dur={duration} begin={`-${Math.abs(parseFloat(delay || "0")) + 3.1}s`} repeatCount="indefinite" path={d} />
      </circle>
    </g>
  );
}

export function HeroOrb({ quiet = false }: { quiet?: boolean }) {
  return (
    <div className={`hero-visual neuron-chat-visual relative mx-auto h-[430px] w-full max-w-[500px] overflow-hidden rounded-[2.5rem] border border-white/[0.065] bg-white/[0.018] shadow-[0_36px_120px_rgba(0,0,0,.42)] ${quiet ? "hero-visual-quiet neuron-chat-visual-quiet" : ""}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_42%,rgba(70,130,255,.12),transparent_48%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,.05),transparent_42%,rgba(72,119,255,.04))]" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <filter id="signal-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="signal-gradient" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#8bbcff" stopOpacity="0.42" />
            <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="node-fill" cx="50%" cy="0%" r="120%">
            <stop stopColor="#182235" stopOpacity="0.82" />
            <stop offset="1" stopColor="#0d0d10" stopOpacity="0.68" />
          </radialGradient>
        </defs>

        <rect x="3" y="5" width="94" height="90" rx="7" className="visual-inner-frame" />
        <g className="connection-layer">
          {paths.map((path, index) => (
            <SignalPath key={path.d} {...path} index={index} />
          ))}
        </g>
        <g className="chat-layer">
          {chats.map((chat, index) => (
            <ChatBlockCard key={chat.title} chat={chat} quiet={quiet} index={index} />
          ))}
        </g>

        <g className="memory-dust" filter="url(#signal-glow)">
          <circle cx="50" cy="44" r="0.5" />
          <circle cx="46" cy="50" r="0.32" />
          <circle cx="54" cy="52" r="0.36" />
          <circle cx="29" cy="48" r="0.28" />
          <circle cx="72" cy="46" r="0.3" />
          <circle cx="38" cy="83" r="0.27" />
          <circle cx="84" cy="84" r="0.24" />
          <circle cx="18" cy="9" r="0.22" />
        </g>
      </svg>

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-200/[0.06] bg-blue-300/[0.018] shadow-[0_0_70px_rgba(70,130,255,.11),inset_0_0_36px_rgba(147,197,253,.035)]" />
      <div className="pointer-events-none absolute left-[18%] top-[14%] h-24 w-24 rounded-full bg-blue-400/[0.045] blur-3xl" />
      <div className="pointer-events-none absolute bottom-[13%] right-[12%] h-28 w-28 rounded-full bg-violet-400/[0.035] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,.045),transparent_44%,rgba(0,0,0,.22))]" />
    </div>
  );
}
