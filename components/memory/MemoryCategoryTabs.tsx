"use client";

import { memoryCategories, MemoryFilter } from "./types";

export function MemoryCategoryTabs({ active, onChange, counts }: { active: MemoryFilter; onChange: (filter: MemoryFilter) => void; counts: Record<MemoryFilter, number> }) {
  const filters: MemoryFilter[] = ["All", ...memoryCategories];
  return <div className="memory-tabs" role="tablist" aria-label="Memory categories">{filters.map(filter=><button key={filter} role="tab" aria-selected={active===filter} onClick={()=>onChange(filter)} className={active===filter?"memory-tab-active":""}><span>{filter}</span><small>{counts[filter]}</small></button>)}</div>;
}
