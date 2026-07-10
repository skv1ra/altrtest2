"use client";

import { motion } from "framer-motion";
import { Archive, ArrowLeft, Check, CheckCircle2, Clock3, FileArchive, History, Instagram, LockKeyhole, Mail, MessageCircle, MessagesSquare, Send, ShieldCheck, Trash2, UploadCloud, X, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { AiMark } from "@/components/Navigation";
import { AltrProfile, getCurrentProfile, hasPlanAccess, PlanId, updateCurrentProfile } from "@/lib/auth";
import { ConversationImport, deleteConversationImport, ImportPlatform, listConversationImports, parseConversationFile, saveConversationImport } from "@/lib/conversationImports";

const platforms: { id: ImportPlatform; name: string; description: string; formats: string; icon: typeof UploadCloud; required: PlanId }[] = [
  { id: "manual", name: "Ручне завантаження", description: "Будь-який підтримуваний файл із переписками.", formats: "JSON, TXT, HTML, CSV, ZIP", icon: UploadCloud, required: "free" },
  { id: "telegram", name: "Telegram", description: "Telegram Desktop → Export chat history.", formats: "JSON, HTML або ZIP", icon: Send, required: "personal" },
  { id: "gmail", name: "Gmail / Takeout", description: "Архів Google Takeout із поштою Gmail.", formats: "MBOX або ZIP", icon: Mail, required: "personal" },
  { id: "whatsapp", name: "WhatsApp", description: "Export chat без медіафайлів.", formats: "TXT або ZIP", icon: MessageCircle, required: "personal" },
  { id: "instagram", name: "Instagram", description: "Download your information → Messages.", formats: "JSON або ZIP", icon: Instagram, required: "personal" },
  { id: "messenger", name: "Messenger", description: "Meta Accounts Center → Download information.", formats: "JSON або ZIP", icon: MessagesSquare, required: "personal" },
];

const planLimits = {
  free: { files: 1, sizeMb: 5, imports: 1 },
  personal: { files: 10, sizeMb: 50, imports: 100 },
  work: { files: 25, sizeMb: 100, imports: 1000 },
} as const;
const planNames: Record<PlanId, string> = { free: "Free", personal: "Personal", work: "Work" };
const statusNames = { queued: "У черзі", processing: "Обробка", completed: "Завершено", failed: "Помилка" } as const;

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function ImportConversationsPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<AltrProfile | null>(null);
  const [selected, setSelected] = useState<ImportPlatform>("manual");
  const [files, setFiles] = useState<File[]>([]);
  const [history, setHistory] = useState<ConversationImport[]>([]);
  const [consent, setConsent] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const current = getCurrentProfile();
    if (!current) { router.replace("/auth?mode=login"); return; }
    setProfile(current); setHistory(listConversationImports(current.id));
  }, [router]);

  if (!profile) return <main className="flex min-h-screen items-center justify-center bg-[#05080c] text-white"><span className="flex items-center gap-3 text-xs uppercase tracking-[.2em] text-cyan-100/50"><AiMark />Завантаження імпорту</span></main>;

  const selectedPlatform = platforms.find(item => item.id === selected)!;
  const limits = planLimits[profile.plan];
  const locked = !hasPlanAccess(profile.plan, selectedPlatform.required);
  const refresh = () => setHistory(listConversationImports(profile.id));

  const choosePlatform = (platform: typeof platforms[number]) => {
    if (!hasPlanAccess(profile.plan, platform.required)) { router.push(`/pricing?feature=import-${platform.id}`); return; }
    setSelected(platform.id); setFiles([]); setError("");
  };

  const acceptFiles = (incoming: File[]) => {
    setError("");
    if (incoming.length > limits.files) return setError(`План ${planNames[profile.plan]} дозволяє до ${limits.files} файл(ів) за один імпорт.`);
    const tooLarge = incoming.find(file => file.size > limits.sizeMb * 1024 * 1024);
    if (tooLarge) return setError(`${tooLarge.name} перевищує ліміт ${limits.sizeMb} MB для плану ${planNames[profile.plan]}.`);
    const allowed = incoming.filter(file => /\.(zip|json|txt|html?|csv|mbox)$/i.test(file.name));
    if (allowed.length !== incoming.length) return setError("Підтримуються лише ZIP, JSON, TXT, HTML, CSV і MBOX.");
    setFiles(allowed);
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => acceptFiles(Array.from(event.target.files ?? []));
  const handleDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setDragging(false); acceptFiles(Array.from(event.dataTransfer.files)); };

  const startImport = async () => {
    setError("");
    if (locked) return router.push(`/pricing?feature=import-${selected}`);
    if (!files.length) return setError("Спочатку виберіть хоча б один файл.");
    if (!consent) return setError("Підтвердьте право на обробку завантажених переписок.");
    if (history.filter(item => item.status === "completed").length >= limits.imports) return router.push("/pricing?feature=import-limit");

    setBusy(true);
    for (const file of files) {
      const id = `IMP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      let record: ConversationImport = { id, userId: profile.id, platform: selected, sourceName: file.name, extractedFiles: [], bytes: file.size, status: "queued", conversations: 0, messages: 0, preview: [], createdAt: new Date().toISOString() };
      saveConversationImport(record); refresh();
      record = { ...record, status: "processing" }; saveConversationImport(record); refresh();
      try {
        const result = await parseConversationFile(file, selected);
        record = { ...record, ...result, status: "completed", completedAt: new Date().toISOString() };
        const current = getCurrentProfile();
        if (current) {
          const updated = updateCurrentProfile({ trainingProgress: Math.min(99, current.trainingProgress + 2), stats: { ...current.stats, conversations: current.stats.conversations + result.conversations, memories: current.stats.memories + Math.min(result.conversations, 10) } });
          if (updated) setProfile(updated);
        }
      } catch (importError) {
        record = { ...record, status: "failed", completedAt: new Date().toISOString(), error: importError instanceof Error ? importError.message : "Невідома помилка імпорту" };
      }
      saveConversationImport(record); refresh();
    }
    setFiles([]); setConsent(false); setBusy(false); if (inputRef.current) inputRef.current.value = "";
  };

  const removeImport = (record: ConversationImport) => {
    if (!confirm(`Видалити імпорт «${record.sourceName}» та повʼязані з ним локальні дані?`)) return;
    deleteConversationImport(record.id);
    if (record.status === "completed") {
      const current = getCurrentProfile();
      if (current) {
        const updated = updateCurrentProfile({ stats: { ...current.stats, conversations: Math.max(0, current.stats.conversations - record.conversations), memories: Math.max(0, current.stats.memories - Math.min(record.conversations, 10)) } });
        if (updated) setProfile(updated);
      }
    }
    refresh();
  };

  const removeAll = () => {
    if (!history.length || !confirm("Видалити всю історію імпортів і всі локально збережені результати?")) return;
    for (const record of history) deleteConversationImport(record.id);
    const current = getCurrentProfile();
    if (current) { const importedConversations = history.filter(item=>item.status==="completed").reduce((sum,item)=>sum+item.conversations,0); const updated=updateCurrentProfile({stats:{...current.stats,conversations:Math.max(0,current.stats.conversations-importedConversations),memories:Math.max(0,current.stats.memories-history.filter(item=>item.status==="completed").reduce((sum,item)=>sum+Math.min(item.conversations,10),0))}}); if(updated)setProfile(updated); }
    refresh();
  };

  const active = history.filter(item => item.status === "queued" || item.status === "processing");
  return <main className="relative min-h-screen overflow-hidden bg-[#05080c] text-white">
    <div className="account-grid pointer-events-none fixed inset-0 opacity-60" /><div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_78%_4%,rgba(47,160,255,.12),transparent_30%)]" />
    <header className="relative z-20 mx-auto flex h-24 max-w-7xl items-center justify-between px-5"><Link href="/" className="flex items-center gap-2 font-semibold">Altr <AiMark /></Link><Link href="/dashboard" className="inline-flex items-center gap-2 text-xs uppercase tracking-[.16em] text-white/42"><ArrowLeft className="h-4 w-4" />До кабінету</Link></header>

    <div className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-8">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="eyebrow">KNOWLEDGE / IMPORT</p><h1 className="mt-5 text-5xl font-medium tracking-[-.06em] md:text-7xl">Import Conversations.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/42">Перенесіть історію спілкування, щоб Altr точніше вивчив ваш тон, контекст і рішення.</p></div><div className="flex items-center gap-3 rounded-full border border-cyan-100/[.09] bg-white/[.025] px-4 py-2 text-xs text-white/38"><ShieldCheck className="h-4 w-4 text-cyan-100/50" />Локальна обробка файлів<span className="plan-pill">{planNames[profile.plan]}</span></div></div>

      <section className="mt-12"><div className="mb-5 flex items-center justify-between"><div><p className="data-label">SUPPORTED PLATFORMS</p><h2 className="mt-2 text-2xl font-medium">Оберіть джерело</h2></div><span className="hidden text-xs text-white/25 sm:block">6 способів імпорту</span></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{platforms.map(platform => { const Icon=platform.icon; const isLocked=!hasPlanAccess(profile.plan,platform.required); return <button key={platform.id} onClick={()=>choosePlatform(platform)} className={`import-platform-card ${selected===platform.id?"import-platform-active":""} ${isLocked?"import-platform-locked":""}`}><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-100/[.08] bg-cyan-200/[.035]"><Icon className="h-5 w-5 text-cyan-100/55" /></span><span className="min-w-0 flex-1 text-left"><strong>{platform.name}</strong><small>{platform.description}</small><em>{platform.formats}</em></span>{isLocked?<span className="locked-badge"><LockKeyhole className="h-3 w-3" />{planNames[platform.required]}</span>:selected===platform.id?<Check className="h-4 w-4 text-cyan-100/70" />:null}</button>})}</div></section>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.08fr_.92fr]">
        <section className="dashboard-panel rounded-[1.7rem] p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="data-label">UPLOAD SOURCE</p><h2 className="mt-3 text-2xl font-medium">{selectedPlatform.name}</h2><p className="mt-2 text-sm text-white/34">{selectedPlatform.formats} · до {limits.sizeMb} MB на файл</p></div><FileArchive className="h-5 w-5 text-cyan-100/42" /></div>
          <div onDragEnter={e=>{e.preventDefault();setDragging(true)}} onDragOver={e=>e.preventDefault()} onDragLeave={()=>setDragging(false)} onDrop={handleDrop} className={`import-dropzone mt-7 ${dragging?"import-dropzone-active":""}`}><UploadCloud className="h-8 w-8 text-cyan-100/55" /><h3 className="mt-4 text-lg font-medium">Перетягніть файли сюди</h3><p className="mt-2 text-sm text-white/30">або виберіть їх вручну</p><button onClick={()=>inputRef.current?.click()} className="glass-button mt-5 rounded-full px-5 py-2.5 text-sm">Вибрати файли</button><input ref={inputRef} className="sr-only" type="file" multiple accept=".zip,.json,.txt,.html,.htm,.csv,.mbox" onChange={handleInput} /></div>
          {files.length>0&&<div className="mt-5 space-y-2">{files.map(file=><div key={`${file.name}-${file.size}`} className="import-file-row"><Archive className="h-4 w-4 text-cyan-100/45" /><span className="min-w-0 flex-1 truncate text-sm">{file.name}</span><span className="text-xs text-white/28">{formatBytes(file.size)}</span><button onClick={()=>setFiles(files.filter(item=>item!==file))} aria-label={`Прибрати ${file.name}`}><X className="h-4 w-4" /></button></div>)}</div>}
          <label className="mt-5 flex cursor-pointer items-start gap-3 text-xs leading-5 text-white/42"><input className="sr-only" type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} /><span className={`checkbox-visual ${consent?"checkbox-visual-active":""}`}>{consent&&<Check className="h-3 w-3" />}</span><span>Я підтверджую, що маю право завантажувати ці переписки, і погоджуюся на їх локальну обробку для створення моєї персональної AI-памʼяті.</span></label>
          {error&&<p role="alert" className="mt-4 rounded-xl border border-red-300/10 bg-red-400/[.06] px-4 py-3 text-sm text-red-100/75">{error}</p>}
          <button disabled={busy||!files.length} onClick={startImport} className="future-button mt-6 flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm disabled:cursor-not-allowed disabled:opacity-45">{busy?<><Clock3 className="h-4 w-4 animate-spin" />Імпортуємо…</>:<><UploadCloud className="h-4 w-4" />Почати імпорт</>}</button>
        </section>

        <section className="dashboard-panel rounded-[1.7rem] p-6 sm:p-8"><p className="data-label">IMPORT STATUS</p><h2 className="mt-3 text-2xl font-medium">Поточна сесія</h2>{active.length?<div className="mt-7 space-y-3">{active.map(item=><div key={item.id} className="import-status-card"><span className="import-spinner" /><div className="min-w-0"><p className="truncate text-sm">{item.sourceName}</p><p className="mt-1 text-xs text-white/28">{statusNames[item.status]} · {platforms.find(platform=>platform.id===item.platform)?.name}</p></div></div>)}</div>:<div className="mt-7 flex min-h-[180px] flex-col items-center justify-center rounded-[1.3rem] border border-dashed border-white/[.08] bg-black/10 text-center"><Clock3 className="h-6 w-6 text-white/20" /><p className="mt-4 text-sm text-white/38">Немає активних імпортів</p><p className="mt-1 text-xs text-white/22">Статус зʼявиться після запуску</p></div>}
          <div className="mt-5 grid grid-cols-3 gap-2">{[["Імпорти",history.filter(i=>i.status==="completed").length],["Діалоги",history.reduce((s,i)=>s+i.conversations,0)],["Повідомлення",history.reduce((s,i)=>s+i.messages,0)]].map(([label,value])=><div key={label} className="rounded-xl border border-white/[.06] bg-white/[.02] p-3"><strong className="block text-lg">{value}</strong><span className="text-[10px] text-white/28">{label}</span></div>)}</div>
        </section>
      </div>

      <section className="mt-6 dashboard-panel rounded-[1.7rem] p-6 sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="data-label">IMPORT HISTORY</p><h2 className="mt-3 text-2xl font-medium">Історія імпортів</h2></div>{history.length>0&&<button onClick={removeAll} className="danger-button inline-flex items-center gap-2 self-start rounded-full px-4 py-2.5 text-xs"><Trash2 className="h-3.5 w-3.5" />Видалити все</button>}</div>
        {history.length?<div className="mt-7 overflow-x-auto"><div className="min-w-[760px] space-y-2">{history.map(record=>{const platform=platforms.find(item=>item.id===record.platform);const StatusIcon=record.status==="completed"?CheckCircle2:record.status==="failed"?XCircle:Clock3;return <div key={record.id} className="import-history-row"><span className={`import-status-icon import-status-${record.status}`}><StatusIcon className="h-4 w-4" /></span><div className="min-w-0 flex-[1.5]"><p className="truncate text-sm">{record.sourceName}</p><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-white/25">{record.id}</p></div><div className="flex-1"><p className="text-xs text-white/55">{platform?.name}</p><p className="mt-1 text-[10px] text-white/25">{record.extractedFiles.length||1} файл(ів)</p></div><div className="flex-1"><p className="text-xs text-white/55">{record.conversations} діалогів</p><p className="mt-1 text-[10px] text-white/25">{record.messages} повідомлень</p></div><div className="flex-1"><p className="text-xs text-white/55">{statusNames[record.status]}</p><p className="mt-1 text-[10px] text-white/25">{new Date(record.createdAt).toLocaleString("uk-UA")}</p></div><button onClick={()=>removeImport(record)} className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200/[.08] text-red-100/35 transition hover:border-red-200/20 hover:text-red-100" aria-label={`Видалити ${record.sourceName}`}><Trash2 className="h-4 w-4" /></button>{record.error&&<p className="col-span-full text-xs text-red-100/55">{record.error}</p>}</div>})}</div></div>:<div className="mt-7 flex min-h-[180px] flex-col items-center justify-center rounded-[1.3rem] border border-dashed border-white/[.08] bg-black/10 text-center"><History className="h-7 w-7 text-white/18" /><p className="mt-4 text-sm text-white/36">Історія поки порожня</p></div>}
      </section>

      <section className="mt-6 rounded-[1.5rem] border border-cyan-100/[.07] bg-white/[.02] p-6"><p className="data-label">SUPPORTED FORMATS</p><div className="mt-4 flex flex-wrap gap-2">{["Telegram JSON / HTML","Google Takeout MBOX","WhatsApp TXT","Instagram JSON","Messenger JSON","Generic JSON / TXT / CSV","ZIP archives"].map(item=><span key={item} className="ai-label"><span className="status-dot-css" />{item}</span>)}</div><p className="mt-5 text-xs leading-6 text-white/28">Файли аналізуються у вашому браузері. У цій демоверсії зберігаються лише локальна історія, лічильники та короткі фрагменти для попереднього перегляду. Для синхронізації між пристроями потрібні серверне сховище, шифрування та контроль доступу.</p></section>
    </div>
  </main>;
}
