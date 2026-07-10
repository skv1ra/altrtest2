"use client";

import { X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { memoryCategories, MemoryCategory, MemoryItem } from "./types";

export function MemoryEditModal({ item, onSave, onCancel }: { item: MemoryItem; onSave: (item: MemoryItem) => void; onCancel: () => void }) {
  const [title,setTitle]=useState(item.title); const [description,setDescription]=useState(item.description); const [category,setCategory]=useState<MemoryCategory>(item.category);
  useEffect(()=>{setTitle(item.title);setDescription(item.description);setCategory(item.category)},[item]);
  const submit=(event:FormEvent)=>{event.preventDefault();if(!title.trim()||!description.trim())return;onSave({...item,title:title.trim(),description:description.trim(),category,lastUpdated:new Date().toISOString().slice(0,10)})};
  return <div className="memory-modal-backdrop" role="presentation"><form onSubmit={submit} className="memory-modal" role="dialog" aria-modal="true" aria-labelledby="edit-memory-title"><div className="flex items-start justify-between"><div><p className="data-label">EDIT MEMORY</p><h2 id="edit-memory-title" className="mt-3 text-3xl font-medium tracking-[-.04em]">Update what Altr knows</h2></div><button type="button" onClick={onCancel} aria-label="Close"><X className="h-5 w-5" /></button></div><div className="mt-7 space-y-5"><label className="settings-field"><span>Title</span><input value={title} onChange={e=>setTitle(e.target.value)} autoFocus /></label><label className="settings-field"><span>Description</span><textarea rows={5} value={description} onChange={e=>setDescription(e.target.value)} /></label><label className="settings-field"><span>Category</span><select value={category} onChange={e=>setCategory(e.target.value as MemoryCategory)}>{memoryCategories.map(value=><option key={value}>{value}</option>)}</select></label></div><div className="mt-7 flex justify-end gap-3"><button type="button" onClick={onCancel} className="glass-button rounded-full px-5 py-3 text-sm">Cancel</button><button className="future-button rounded-full px-5 py-3 text-sm">Save Changes</button></div></form></div>;
}
