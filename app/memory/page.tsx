"use client";

import { ArrowLeft, BrainCircuit, Search, Trash2, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AiMark } from "@/components/Navigation";
import { DataSourcesPanel } from "@/components/memory/DataSourcesPanel";
import { MemoryCard } from "@/components/memory/MemoryCard";
import { MemoryCategoryTabs } from "@/components/memory/MemoryCategoryTabs";
import { MemoryDeleteModal } from "@/components/memory/MemoryDeleteModal";
import { MemoryEditModal } from "@/components/memory/MemoryEditModal";
import { MemoryStatusPanel } from "@/components/memory/MemoryStatusPanel";
import { memoryCategories, MemoryFilter, MemoryItem } from "@/components/memory/types";
import { initialMemoryItems } from "@/lib/memoryData";

export default function MemoryPage() {
  const [items, setItems] = useState<MemoryItem[]>(initialMemoryItems);
  const [learning, setLearning] = useState(true);
  const [filter, setFilter] = useState<MemoryFilter>("All");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<MemoryItem | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const counts = useMemo(() => {
    const result = { All: items.length } as Record<MemoryFilter, number>;
    for (const category of memoryCategories) result[category] = items.filter(item => item.category === category).length;
    return result;
  }, [items]);

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter(item => (filter === "All" || item.category === filter) && (!query || `${item.title} ${item.description} ${item.source}`.toLowerCase().includes(query)));
  }, [items, filter, search]);

  const lastUpdate = items.length ? [...items].sort((a,b)=>b.lastUpdated.localeCompare(a.lastUpdated))[0].lastUpdated : "—";
  const saveMemory = (updated: MemoryItem) => { setItems(current=>current.map(item=>item.id===updated.id?updated:item)); setEditing(null); };
  const deleteMemory = () => { if (deleting) setItems(current=>current.filter(item=>item.id!==deleting)); setDeleting(null); };

  return <main className="relative min-h-screen overflow-hidden bg-[#05080c] text-white">
    <div className="account-grid pointer-events-none fixed inset-0 opacity-60" /><div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_78%_5%,rgba(47,160,255,.12),transparent_30%),radial-gradient(circle_at_10%_70%,rgba(103,232,249,.05),transparent_28%)]" />
    <header className="relative z-20 mx-auto flex h-24 max-w-7xl items-center justify-between px-5"><Link href="/" className="flex items-center gap-2 font-semibold">Altr <AiMark /></Link><div className="flex items-center gap-3"><Link href="/import-conversations" className="glass-button hidden items-center gap-2 rounded-full px-4 py-2.5 text-xs sm:inline-flex"><UploadCloud className="h-3.5 w-3.5" />Import Conversations</Link><Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[.16em] text-white/42"><ArrowLeft className="h-4 w-4" />Home</Link></div></header>

    <div className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><p className="eyebrow">ALTR / MEMORY CONTROL</p><h1 className="mt-5 text-6xl font-medium tracking-[-.07em] md:text-8xl">Memory.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/42">Control what Altr learns, remembers and uses when writing as you.</p></div><button onClick={()=>setClearing(true)} disabled={!items.length} className="danger-button inline-flex items-center gap-2 self-start rounded-full px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-35"><Trash2 className="h-4 w-4" />Clear All Memory</button></div>

      <div className="mt-10"><MemoryStatusPanel learning={learning} total={items.length} active={items.filter(item=>item.isActive).length} lastUpdate={lastUpdate} onToggle={()=>setLearning(value=>!value)} /></div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_310px]">
        <section className="min-w-0">
          <div className="dashboard-panel rounded-[1.6rem] p-4 sm:p-5"><div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/28" /><input value={search} onChange={event=>setSearch(event.target.value)} className="memory-search" placeholder="Search title, context or source…" /></div><div className="mt-4"><MemoryCategoryTabs active={filter} onChange={setFilter} counts={counts} /></div></div>

          {visibleItems.length ? <div className="mt-4 grid gap-4 md:grid-cols-2">{visibleItems.map(item=><MemoryCard key={item.id} item={item} onEdit={()=>setEditing(item)} onDelete={()=>setDeleting(item.id)} onToggle={()=>setItems(current=>current.map(memory=>memory.id===item.id?{...memory,isActive:!memory.isActive}:memory))} />)}</div> : items.length ? <div className="memory-empty mt-4"><Search className="h-7 w-7 text-white/20" /><h2>No matching memories.</h2><p>Try a different category or search phrase.</p><button onClick={()=>{setFilter("All");setSearch("")}} className="glass-button rounded-full px-5 py-3 text-sm">Reset filters</button></div> : <div className="memory-empty mt-4"><span className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-100/[.1] bg-cyan-200/[.035]"><BrainCircuit className="h-7 w-7 text-cyan-100/45" /></span><h2>No memory stored yet.</h2><p>Connect your conversations to let Altr start learning your communication patterns.</p><button type="button" className="future-button rounded-full px-5 py-3 text-sm">Connect Data Source</button></div>}
        </section>

        <aside className="space-y-4"><DataSourcesPanel /><section className="dashboard-panel rounded-[1.6rem] p-6"><p className="data-label">MEMORY PRINCIPLES</p><div className="mt-5 space-y-4 text-xs leading-5 text-white/32"><p><strong className="text-white/60">You stay in control.</strong><br />Pause learning, edit any insight or remove it completely.</p><p><strong className="text-white/60">Confidence is visible.</strong><br />Every memory shows how certain Altr is and where it came from.</p><p><strong className="text-white/60">Inactive means ignored.</strong><br />Disabled memories remain visible but are not used for writing.</p></div></section></aside>
      </div>
    </div>

    {editing&&<MemoryEditModal item={editing} onSave={saveMemory} onCancel={()=>setEditing(null)} />}
    {deleting&&<MemoryDeleteModal onConfirm={deleteMemory} onCancel={()=>setDeleting(null)} />}
    {clearing&&<MemoryDeleteModal all onConfirm={()=>{setItems([]);setClearing(false)}} onCancel={()=>setClearing(false)} />}
  </main>;
}
