"use client";

import { ArrowLeft, BrainCircuit, Search, Trash2, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AiMark } from "@/components/Navigation";

type Memory = {
  id: string;
  category: string;
  title: string;
  description: string;
  confidence: number;
  source_reference: string;
  is_active: boolean;
  updated_at: string;
};

export default function MemoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<Memory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const response = await fetch("/api/memories", { cache: "no-store" });
    if (response.status === 401) return router.replace("/auth?mode=login");
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) setError(payload.error ?? "MEMORY_LOAD_FAILED");
    else setItems(payload.memories ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter(item => !query || `${item.title} ${item.description} ${item.source_reference}`.toLowerCase().includes(query));
  }, [items, search]);

  const toggle = async (memory: Memory) => {
    const response = await fetch(`/api/memories/${memory.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !memory.is_active }) });
    if (response.ok) await load();
  };

  const remove = async (memory: Memory) => {
    if (!confirm(`Delete memory: ${memory.title}?`)) return;
    const response = await fetch(`/api/memories/${memory.id}`, { method: "DELETE" });
    if (response.ok) await load();
  };

  const clearAll = async () => {
    if (!items.length || !confirm("Delete all visible memories? This removes server records you own.")) return;
    for (const item of items) await fetch(`/api/memories/${item.id}`, { method: "DELETE" });
    await load();
  };

  const activeCount = items.filter(item => item.is_active).length;
  const lastUpdate = items.length ? [...items].sort((a,b)=>b.updated_at.localeCompare(a.updated_at))[0].updated_at : "—";

  return <main className="relative min-h-screen overflow-hidden bg-[#05080c] text-white">
    <div className="account-grid pointer-events-none fixed inset-0 opacity-60" /><div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_78%_5%,rgba(47,160,255,.12),transparent_30%),radial-gradient(circle_at_10%_70%,rgba(103,232,249,.05),transparent_28%)]" />
    <header className="relative z-20 mx-auto flex h-24 max-w-7xl items-center justify-between px-5"><Link href="/" className="flex items-center gap-2 font-semibold">Altr <AiMark /></Link><div className="flex items-center gap-3"><Link href="/import-conversations" className="glass-button hidden items-center gap-2 rounded-full px-4 py-2.5 text-xs sm:inline-flex"><UploadCloud className="h-3.5 w-3.5" />Import Conversations</Link><Link href="/dashboard" className="inline-flex items-center gap-2 text-xs uppercase tracking-[.16em] text-white/42"><ArrowLeft className="h-4 w-4" />Dashboard</Link></div></header>
    <div className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><p className="eyebrow">ALTR / MEMORY CONTROL</p><h1 className="mt-5 text-6xl font-medium tracking-[-.07em] md:text-8xl">Memory.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/42">Control server-stored memories with visible source references. Disabled memories are ignored by draft generation.</p></div><button onClick={clearAll} disabled={!items.length} className="danger-button inline-flex items-center gap-2 self-start rounded-full px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-35"><Trash2 className="h-4 w-4" />Clear All Memory</button></div>
      <section className="dashboard-panel mt-10 rounded-[1.6rem] p-6"><div className="grid gap-4 md:grid-cols-3"><div><p className="data-label">TOTAL</p><b className="mt-3 block text-4xl font-medium">{items.length}</b></div><div><p className="data-label">ACTIVE</p><b className="mt-3 block text-4xl font-medium">{activeCount}</b></div><div><p className="data-label">LAST UPDATE</p><b className="mt-3 block text-lg font-medium">{lastUpdate === "—" ? "—" : new Date(lastUpdate).toLocaleDateString("uk-UA")}</b></div></div></section>
      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_310px]"><section className="min-w-0"><div className="dashboard-panel rounded-[1.6rem] p-4 sm:p-5"><div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/28" /><input value={search} onChange={event=>setSearch(event.target.value)} className="memory-search" placeholder="Search title, context or source…" /></div></div>{error&&<p className="mt-4 rounded-xl border border-red-300/10 bg-red-400/[.06] px-4 py-3 text-sm text-red-100/75">{error}</p>}{loading ? <div className="memory-empty mt-4"><BrainCircuit className="h-7 w-7 text-cyan-100/45" /><h2>Loading memory…</h2></div> : visibleItems.length ? <div className="mt-4 grid gap-4 md:grid-cols-2">{visibleItems.map(item=><article key={item.id} className="dashboard-panel rounded-[1.6rem] p-6"><div className="mb-5 flex items-start justify-between gap-4"><span className="data-label">{item.category}</span><span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[.14em] ${item.is_active ? "border-cyan-100/15 text-cyan-100/60" : "border-white/10 text-white/25"}`}>{item.is_active ? "active" : "ignored"}</span></div><h2 className="text-xl font-medium tracking-[-.03em]">{item.title}</h2><p className="mt-3 text-sm leading-6 text-white/42">{item.description}</p><div className="mt-5 rounded-2xl border border-cyan-100/[.07] bg-cyan-200/[.025] p-3 text-xs leading-5 text-white/35"><b className="text-white/55">Source:</b> {item.source_reference}<br/><b className="text-white/55">Confidence:</b> {Math.round(item.confidence * 100)}%</div><div className="mt-5 flex flex-wrap gap-2"><button onClick={()=>toggle(item)} className="glass-button rounded-full px-4 py-2 text-xs">{item.is_active ? "Pause" : "Activate"}</button><button onClick={()=>remove(item)} className="danger-button rounded-full px-4 py-2 text-xs">Delete</button></div></article>)}</div> : <div className="memory-empty mt-4"><span className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-100/[.1] bg-cyan-200/[.035]"><BrainCircuit className="h-7 w-7 text-cyan-100/45" /></span><h2>No memory stored yet.</h2><p>Import conversations to create transparent memory with source references.</p><Link href="/import-conversations" className="future-button rounded-full px-5 py-3 text-sm">Connect Data Source</Link></div>}</section><aside className="space-y-4"><section className="dashboard-panel rounded-[1.6rem] p-6"><p className="data-label">MEMORY PRINCIPLES</p><div className="mt-5 space-y-4 text-xs leading-5 text-white/32"><p><strong className="text-white/60">You stay in control.</strong><br />Pause, delete, and inspect source references.</p><p><strong className="text-white/60">Imported text is untrusted.</strong><br />Memory can guide style, but cannot override AI safety instructions.</p><p><strong className="text-white/60">Draft-only output.</strong><br />Memories help create drafts, not automatic sends.</p></div></section></aside></div>
    </div>
  </main>;
}
