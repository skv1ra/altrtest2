"use client";

import { useReducedMotion } from "framer-motion";

const chatCards = [
  { x: 8, y: 12, w: 31, h: 20, title: "Client", lines: [78,55,68] },
  { x: 60, y: 9, w: 31, h: 19, title: "Email", lines: [66,82,48] },
  { x: 13, y: 61, w: 32, h: 21, title: "Team", lines: [58,78,44] },
  { x: 58, y: 58, w: 33, h: 23, title: "Memory", lines: [72,52,86] },
  { x: 36, y: 36, w: 29, h: 21, title: "Altr", lines: [88,64,42] },
];
const links = [
  { d:"M39 23 C47 24 52 31 57 39", delay:"0s", dur:"8s" },
  { d:"M60 26 C55 33 54 36 61 44", delay:"-2.2s", dur:"9s" },
  { d:"M43 66 C48 59 50 56 50 50", delay:"-4s", dur:"8.5s" },
  { d:"M65 66 C61 58 58 52 57 47", delay:"-1s", dur:"10s" },
  { d:"M24 32 C25 46 27 55 38 63", delay:"-3.4s", dur:"9.5s" },
  { d:"M75 29 C80 42 78 53 72 61", delay:"-5.5s", dur:"11s" },
  { d:"M45 46 C38 45 31 42 26 35", delay:"-6.2s", dur:"10.5s" },
  { d:"M62 45 C69 45 75 41 82 32", delay:"-7s", dur:"9.2s" },
];

function Signal({ d, delay, dur, index, reducedMotion }: { d:string; delay:string; dur:string; index:number; reducedMotion:boolean }) {
  return <g><path d={d} className="hud-link" /><path d={d} className="hud-link-pulse" style={{ animationDelay: delay }} /><circle r={index%3===0?.92:.7} className="hud-signal">{!reducedMotion&&<animateMotion dur={dur} begin={delay} repeatCount="indefinite" path={d} />}</circle><circle r=".34" className="hud-signal hud-signal-soft">{!reducedMotion&&<animateMotion dur={dur} begin={`-${Math.abs(parseFloat(delay||"0"))+2.7}s`} repeatCount="indefinite" path={d} />}</circle></g>;
}

export function HeroOrb({ quiet = false }: { quiet?: boolean }) {
  const reducedMotion = Boolean(useReducedMotion());
  return <div className={`activation-visual relative mx-auto h-[470px] w-full max-w-[540px] overflow-hidden rounded-[32px] ${quiet?"activation-visual-quiet":""}`}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_51%_45%,rgba(57,151,255,.16),transparent_42%),linear-gradient(145deg,rgba(255,255,255,.055),transparent_32%,rgba(6,33,61,.18))]" /><div className="absolute inset-[1px] rounded-[31px] border border-cyan-200/[0.08] bg-[#06101a]/45 backdrop-blur-md" />{!reducedMotion&&<div className="hud-scan" />}
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true"><defs><filter id="blueGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.1" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter><linearGradient id="cardEdge" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#bce7ff" stopOpacity=".2" /><stop offset=".55" stopColor="#4ea5ff" stopOpacity=".035" /><stop offset="1" stopColor="#fff" stopOpacity=".08" /></linearGradient></defs>
      <g opacity=".42"><path d="M8 88 H92" className="hud-grid-line" /><path d="M8 8 V88" className="hud-grid-line" /><path d="M92 8 V88" className="hud-grid-line" /><path d="M8 8 H92" className="hud-grid-line" /></g>
      {links.map((link,index)=><Signal key={link.d} {...link} index={index} reducedMotion={reducedMotion} />)}
      <g filter="url(#blueGlow)">{chatCards.map((card,index)=><g key={card.title} className="chat-node" style={{animationDelay:`${index*.18}s`}}><rect x={card.x} y={card.y} width={card.w} height={card.h} rx="4.2" className="chat-node-shell" /><rect x={card.x+1.3} y={card.y+1.3} width={card.w-2.6} height={card.h-2.6} rx="3.3" className="chat-node-inner" /><circle cx={card.x+4.2} cy={card.y+4.7} r=".72" className="status-dot" /><text x={card.x+6.3} y={card.y+6} className="chat-node-title">{card.title}</text>{card.lines.map((width,lineIndex)=><rect key={lineIndex} x={card.x+4.2} y={card.y+10.2+lineIndex*3.7} width={(card.w-8)*width/100} height=".75" rx=".38" className="chat-node-line" />)}</g>)}</g>
      <g filter="url(#blueGlow)" className="central-core"><circle cx="50" cy="47" r="8.6" className="core-ring" /><circle cx="50" cy="47" r="3.2" className="core-dot" /><path d="M45.2 47 H54.8 M50 42.2 V51.8" className="core-cross" /></g>
    </svg>
  </div>;
}
