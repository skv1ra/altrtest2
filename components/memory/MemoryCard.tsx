"use client";

import { CalendarClock, Database, Pencil, Trash2 } from "lucide-react";
import { MemoryItem } from "./types";

export function MemoryCard({ item, onEdit, onDelete, onToggle }: { item: MemoryItem; onEdit: () => void; onDelete: () => void; onToggle: () => void }) {
  return <article className={`memory-card ${item.isActive ? "" : "memory-card-inactive"}`}>
    <div className="flex flex-wrap items-start justify-between gap-3"><span className="memory-category-label">{item.category}</span><button onClick={onToggle} className={`memory-status ${item.isActive ? "memory-status-active" : ""}`}><span />{item.isActive ? "Active" : "Inactive"}</button></div>
    <h3 className="mt-5 text-xl font-medium tracking-[-.035em]">{item.title}</h3>
    <p className="mt-3 min-h-[52px] text-sm leading-6 text-white/40">{item.description}</p>
    <div className="mt-6"><div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[.14em]"><span className="text-white/28">Confidence</span><span className="text-cyan-100/58">{item.confidence}%</span></div><div className="memory-confidence"><span style={{ width: `${item.confidence}%` }} /></div></div>
    <div className="mt-6 grid gap-2 text-xs text-white/28 sm:grid-cols-2"><span className="flex items-center gap-2"><Database className="h-3.5 w-3.5" />{item.source}</span><span className="flex items-center gap-2 sm:justify-end"><CalendarClock className="h-3.5 w-3.5" />{new Date(item.lastUpdated).toLocaleDateString("en-GB")}</span></div>
    <div className="mt-6 flex gap-2 border-t border-white/[.06] pt-5"><button onClick={onEdit} className="glass-button inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs"><Pencil className="h-3.5 w-3.5" />Edit</button><button onClick={onDelete} className="danger-button inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs"><Trash2 className="h-3.5 w-3.5" />Delete</button></div>
  </article>;
}
