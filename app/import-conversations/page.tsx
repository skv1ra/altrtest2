"use client";

import { Archive, ArrowLeft, Check, FileArchive, Instagram, LockKeyhole, Mail, MessageCircle, MessagesSquare, Send, ShieldCheck, UploadCloud, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { AiMark } from "@/components/Navigation";
import { AltrProfile, getCurrentProfile, hasPlanAccess, PlanId } from "@/lib/auth";

type ImportPlatform = "manual" | "telegram" | "gmail" | "whatsapp" | "instagram" | "messenger";

type ImportRecord = { id: string; platform: ImportPlatform; source_name: string; bytes: number; status: string; conversations: number; messages: number; created_at: string; error?: string | null };

const platforms: { id: ImportPlatform; name: string; description: string; formats: string; icon: typeof UploadCloud; required: PlanId }[] = [
  { id: "manual", name: "Ручне завантаження", description: "Будь-який підтримуваний файл із переписками.", formats: "JSON, TXT, HTML, CSV, ZIP", icon: UploadCloud, required: "free" },
  { id: "telegram", name: "Telegram", description: "Telegram Desktop → Export chat history.", formats: "JSON, HTML або ZIP", icon: Send, required: "personal" },
  { id: "gmail", name: "Gmail / Takeout", description: "Архів Google Takeout із поштою Gmail.", formats: "MBOX або ZIP", icon: Mail, required: "personal" },
  { id: "whatsapp", name: "WhatsApp", description: "Export chat без медіафайлів.", formats: "TXT або ZIP", icon: MessageCircle, required: "personal" },
  { id: "instagram", name: "Instagram", description: "Download your information → Messages.", formats: "JSON або ZIP", icon: Instagram, required: "personal" },
  { id: "messenger", name: "Messenger", description: "Meta Accounts Center → Download information.", formats: "JSON або ZIP", icon: MessagesSquare, required: "personal" },
];

const planLimits = { free: { files: 1, sizeMb: 5, imports: 1 }, personal: { files: 10, sizeMb: 50, imports: 100 }, work: { files: 25, sizeMb: 100, imports: 1000 } } as const;
const planNames: Record<PlanId, string> = { free: "Free", personal: "Personal", work: "Work" };
function formatBytes(bytes: number) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`; }

export default function ImportConversationsPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<AltrProfile | null>(null);
  const [selected, setSelected] = useState<ImportPlatform>("manual");
  const [files, setFiles] = useState<File[]>([]);
  const [history, setHistory] = useState<ImportRecord[]>([]);
  const [consent, setConsent] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    const response = await fetch("/api/imports", { cache: "no-store" });
    if (response.ok) setHistory((await response.json()).imports ?? []);
  };

  useEffect(() => {
    getCurrentProfile().then((current) => { if (!current) router.replace("/auth?mode=login"); else { setProfile(current); loadHistory(); } });
  }, [router]);

  if (!profile) return <main className="flex min-h-screen items-center justify-center bg-[#05080c] text-white"><span className="flex items-center gap-3 text-xs uppercase tracking-[.2em] text-cyan-100/50"><AiMark />Завантаження імпорту</span></main>;

  const selectedPlatform = platforms.find(item => item.id === selected)!;
  const limits = planLimits[profile.plan];
  const locked = !hasPlanAccess(profile.plan, selectedPlatform.required);

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
    try {
      for (const file of files) {
        const body = new FormData();
        body.append("platform", selected);
        body.append("file", file);
        const response = await fetch("/api/imports", { method: "POST", body });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error ?? "IMPORT_FAILED");
      }
      await loadHistory();
      setFiles([]); setConsent(false); if (inputRef.current) inputRef.current.value = "";
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Помилка імпорту");
    } finally { setBusy(false); }
  };

  const removeImport = async (id: string) => { if (!confirm("Видалити імпорт та повʼязані серверні дані?")) return; await fetch(`/api/imports/${id}`, { method: "DELETE" }); await loadHistory(); };

  return <main className="relative min-h-screen overflow-hidden bg-[#05080c] text-white">
    <div className="account-grid pointer-events-none fixed inset-0 opacity-60" /><div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_78%_4%,rgba(47,160,255,.12),transparent_30%)]" />
    <header className="relative z-20 mx-auto flex h-24 max-w-7xl items-center justify-between px-5"><Link href="/" className="flex items-center gap-2 font-semibold">Altr <AiMark /></Link><Link href="/dashboard" className="inline-flex items-center gap-2 text-xs uppercase tracking-[.16em] text-white/42"><ArrowLeft className="h-4 w-4" />До кабінету</Link></header>
    <div className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-8"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="eyebrow">KNOWLEDGE / IMPORT</p><h1 className="mt-5 text-5xl font-medium tracking-[-.06em] md:text-7xl">Import Conversations.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/42">Перенесіть історію спілкування, щоб Altr точніше вивчив ваш тон, контекст і рішення.</p></div><div className="flex items-center gap-3 rounded-full border border-cyan-100/[.09] bg-white/[.025] px-4 py-2 text-xs text-white/38"><ShieldCheck className="h-4 w-4 text-cyan-100/50" />Серверний імпорт<span className="plan-pill">{planNames[profile.plan]}</span></div></div>
      <section className="mt-12"><div className="mb-5 flex items-center justify-between"><div><p className="data-label">SUPPORTED PLATFORMS</p><h2 className="mt-2 text-2xl font-medium">Оберіть джерело</h2></div><span className="hidden text-xs text-white/25 sm:block">6 способів імпорту</span></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{platforms.map(platform => { const Icon=platform.icon; const isLocked=!hasPlanAccess(profile.plan,platform.required); return <button key={platform.id} onClick={()=>choosePlatform(platform)} className={`import-platform-card ${selected===platform.id?"import-platform-active":""} ${isLocked?"import-platform-locked":""}`}><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-100/[.08] bg-cyan-200/[.035]"><Icon className="h-5 w-5 text-cyan-100/55" /></span><span className="min-w-0 flex-1 text-left"><strong>{platform.name}</strong><small>{platform.description}</small><em>{platform.formats}</em></span>{isLocked?<span className="locked-badge"><LockKeyhole className="h-3 w-3" />{planNames[platform.required]}</span>:selected===platform.id?<Check className="h-4 w-4 text-cyan-100/70" />:null}</button>})}</div></section>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.08fr_.92fr]"><section className="dashboard-panel rounded-[1.7rem] p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="data-label">UPLOAD SOURCE</p><h2 className="mt-3 text-2xl font-medium">{selectedPlatform.name}</h2><p className="mt-2 text-sm text-white/34">{selectedPlatform.formats} · до {limits.sizeMb} MB на файл</p></div><FileArchive className="h-5 w-5 text-cyan-100/42" /></div><div onDragEnter={e=>{e.preventDefault();setDragging(true)}} onDragOver={e=>e.preventDefault()} onDragLeave={()=>setDragging(false)} onDrop={handleDrop} className={`import-dropzone mt-7 ${dragging?"import-dropzone-active":""}`}><UploadCloud className="h-8 w-8 text-cyan-100/55" /><h3 className="mt-4 text-lg font-medium">Перетягніть файли сюди</h3><p className="mt-2 text-sm text-white/30">або виберіть їх вручну</p><button onClick={()=>inputRef.current?.click()} className="glass-button mt-5 rounded-full px-5 py-2.5 text-sm">Вибрати файли</button><input ref={inputRef} className="sr-only" type="file" multiple accept=".zip,.json,.txt,.html,.htm,.csv,.mbox" onChange={handleInput} /></div>{files.length>0&&<div className="mt-5 space-y-2">{files.map(file=><div key={`${file.name}-${file.size}`} className="import-file-row"><Archive className="h-4 w-4 text-cyan-100/45" /><span className="min-w-0 flex-1 truncate text-sm">{file.name}</span><span className="text-xs text-white/28">{formatBytes(file.size)}</span><button onClick={()=>setFiles(files.filter(item=>item!==file))} aria-label={`Прибрати ${file.name}`}><X className="h-4 w-4" /></button></div>)}</div>}<label className="mt-5 flex cursor-pointer items-start gap-3 text-xs leading-5 text-white/42"><input className="sr-only" type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} /><span className={`checkbox-visual ${consent?"checkbox-visual-active":""}`}>{consent&&<Check className="h-3 w-3" />}</span><span>Я підтверджую, що маю право завантажити ці переписки, і розумію, що імпортований текст є untrusted data.</span></label>{error&&<p className="mt-4 rounded-xl border border-red-300/10 bg-red-400/[.06] px-4 py-3 text-sm text-red-100/75">{error}</p>}<button disabled={busy || locked} onClick={startImport} className="future-button mt-6 w-full rounded-full px-5 py-3.5 text-sm disabled:opacity-45">{busy?"Імпортуємо...":"Start secure import"}</button></section>
      <section className="dashboard-panel rounded-[1.7rem] p-6 sm:p-8"><p className="data-label">IMPORT HISTORY</p><h2 className="mt-3 text-2xl font-medium">Історія</h2><div className="mt-6 space-y-3">{history.length?history.map(record=><div key={record.id} className="import-file-row"><Archive className="h-4 w-4 text-cyan-100/45" /><span className="min-w-0 flex-1"><b className="block truncate text-sm">{record.source_name}</b><small className="text-white/30">{record.status} · {record.messages} messages</small></span><button onClick={()=>removeImport(record.id)} className="text-white/28 hover:text-red-100">Delete</button></div>):<p className="text-sm leading-6 text-white/35">Імпортів ще немає.</p>}</div></section></div>
    </div>
  </main>;
}
