"use client";

import { AlertTriangle } from "lucide-react";

export function MemoryDeleteModal({ all = false, onConfirm, onCancel }: { all?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return <div className="memory-modal-backdrop" role="presentation"><div className="memory-modal max-w-[520px]" role="dialog" aria-modal="true" aria-labelledby="delete-memory-title"><span className="flex h-12 w-12 items-center justify-center rounded-full border border-red-200/[.12] bg-red-400/[.06]"><AlertTriangle className="h-5 w-5 text-red-100/65" /></span><h2 id="delete-memory-title" className="mt-6 text-3xl font-medium tracking-[-.04em]">{all?"Clear all memory?":"Delete this memory?"}</h2><p className="mt-4 text-sm leading-6 text-white/40">{all?"This will remove everything Altr has learned from your communication style, context, relationships and decisions.":"This memory will be removed from your personal AI model. This action cannot be undone."}</p><div className="mt-8 flex justify-end gap-3"><button onClick={onCancel} className="glass-button rounded-full px-5 py-3 text-sm">Cancel</button><button onClick={onConfirm} className="danger-button rounded-full px-5 py-3 text-sm">{all?"Clear All Memory":"Delete Memory"}</button></div></div></div>;
}
