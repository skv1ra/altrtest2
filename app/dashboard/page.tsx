"use client";

import { motion } from "framer-motion";
import { Bot, BrainCircuit, CreditCard, Database, Home, LogOut, Save, Settings2, ShieldCheck, Sparkles, Trash2, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { AiMark } from "@/components/Navigation";
import { AltrProfile, deleteCurrentAccount, getCurrentProfile, PlanId, signOutAccount, ToneMode, updateCurrentProfile } from "@/lib/auth";

type Tab = "overview" | "data" | "settings";
const menu = [{ id: "overview" as Tab, label: "Мій Altr", icon: BrainCircuit }, { id: "data" as Tab, label: "Дані й памʼять", icon: Database }, { id: "settings" as Tab, label: "Налаштування", icon: Settings2 }];
const tones: Record<ToneMode, string> = { balanced: "Збалансований", warm: "Теплий", direct: "Прямий", formal: "Формальний" };
const planNames: Record<PlanId, string> = { free: "Free", personal: "Personal", work: "Work" };

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`dashboard-panel rounded-[1.65rem] ${className}`}>{children}</section>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<AltrProfile | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [saved, setSaved] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");

  useEffect(() => {
    getCurrentProfile().then((current) => current ? setProfile(current) : router.replace("/auth?mode=login"));
  }, [router]);

  if (!profile) return <main className="flex min-h-screen items-center justify-center bg-[#05080c] text-white"><span className="flex items-center gap-3 text-xs uppercase tracking-[.2em] text-cyan-100/50"><AiMark />Завантаження профілю</span></main>;

  const persist = async (update: Partial<AltrProfile>) => {
    const next = await updateCurrentProfile(update);
    setProfile(next);
    return next;
  };
  const leave = async () => { await signOutAccount(); router.push("/"); };
  const remove = async () => { if (confirm("Видалити акаунт і всі серверні дані Altr? Введене підтвердження буде відправлено на сервер.")) { await deleteCurrentAccount("DELETE"); router.push("/"); } };
  const firstName = profile.name.split(" ")[0];

  const createDraft = async () => {
    const response = await fetch("/api/ai/draft-reply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sourceText: draftMessage, tone: profile.tone }) });
    const result = await response.json();
    if (!response.ok) return alert(result.error ?? "Draft failed");
    alert(result.draftText);
    setProfile(await getCurrentProfile());
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05080c] text-white">
      <div className="account-grid pointer-events-none fixed inset-0 opacity-60" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_80%_5%,rgba(47,160,255,.11),transparent_30%)]" />
      <aside className="dashboard-sidebar fixed inset-y-0 left-0 z-30 hidden w-[272px] border-r border-cyan-100/[.065] p-5 lg:flex lg:flex-col">
        <Link href="/" className="flex h-14 items-center gap-2 px-3 text-[15px] font-semibold">Altr <AiMark /></Link>
        <nav className="mt-10 space-y-2">{menu.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`dashboard-nav-item w-full ${tab === id ? "dashboard-nav-active" : ""}`}><Icon className="h-[18px] w-[18px]" />{label}{tab === id && <span className="status-dot-css ml-auto" />}</button>)}<Link href="/memory" className="dashboard-nav-item w-full"><BrainCircuit className="h-[18px] w-[18px]" />AI Memory</Link><Link href="/assistants" className="dashboard-nav-item w-full"><Bot className="h-[18px] w-[18px]" />AI Assistants</Link><Link href="/import-conversations" className="dashboard-nav-item w-full"><UploadCloud className="h-[18px] w-[18px]" />Імпорт переписок</Link><Link href="/pricing" className="dashboard-nav-item w-full"><CreditCard className="h-[18px] w-[18px]" />Підписка<span className="ml-auto rounded-full border border-cyan-100/10 px-2 py-1 text-[9px] uppercase tracking-[.12em] text-cyan-100/45">{planNames[profile.plan]}</span></Link></nav>
        <div className="mt-auto"><button onClick={leave} className="dashboard-nav-item w-full"><LogOut className="h-4 w-4" />Вийти</button></div>
      </aside>
      <div className="relative z-10 lg:pl-[272px]"><header className="sticky top-0 z-20 border-b border-cyan-100/[.055] bg-[#05080c]/80 px-4 backdrop-blur-2xl sm:px-7 lg:px-10"><div className="mx-auto flex h-[82px] max-w-[1400px] items-center justify-between"><Link href="/" className="flex items-center gap-2 font-semibold lg:hidden">Altr <AiMark /></Link><p className="hidden text-xs uppercase tracking-[.18em] text-white/27 lg:block">Особистий кабінет / <span className="text-cyan-100/52">{menu.find(x => x.id === tab)?.label}</span></p><div className="flex items-center gap-3"><Link href="/" className="profile-action hidden sm:flex" aria-label="На головну"><Home className="h-4 w-4" /></Link><button onClick={() => setTab("settings")} className="flex items-center gap-3 rounded-full border border-white/[.07] bg-white/[.028] py-1.5 pl-1.5 pr-4"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-100/15 bg-cyan-200/[.07]">{profile.name[0]?.toUpperCase()}</span><span className="hidden text-left sm:block"><b className="block text-sm font-medium">{profile.name}</b><small className="text-[10px] uppercase tracking-[.14em] text-cyan-100/40">{planNames[profile.plan]} plan</small></span></button></div></div><nav className="flex gap-1 overflow-x-auto pb-3 lg:hidden">{menu.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`mobile-dashboard-tab ${tab === id ? "mobile-dashboard-tab-active" : ""}`}><Icon className="h-4 w-4" />{label}</button>)}</nav></header>
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-7 lg:px-10">
          {tab === "overview" && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><h1 className="text-4xl font-medium tracking-[-.055em] sm:text-5xl">Привіт, {firstName}.</h1><p className="mt-3 text-white/38">Твій цифровий двійник формується з дозволених джерел.</p><Panel className="altr-hero-panel relative mt-8 overflow-hidden p-6 sm:p-9"><div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_.8fr]"><div><div className="flex items-center gap-3"><span className="data-label">YOUR ALTR / LEARNING</span><Link href="/pricing" className="plan-pill">{planNames[profile.plan]}</Link></div><h2 className="mt-6 text-4xl font-medium tracking-[-.055em] sm:text-5xl">{profile.altrName}</h2><p className="mt-4 max-w-xl leading-7 text-white/42">{profile.bio}</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/import-conversations" className="future-button rounded-full px-5 py-3 text-sm">Імпортувати дані</Link><button onClick={() => setTab("data")} className="glass-button rounded-full px-5 py-3 text-sm">Створити чернетку</button></div></div><div className="progress-orb mx-auto flex h-56 w-56 items-center justify-center rounded-full" style={{ "--progress": `${profile.trainingProgress * 3.6}deg` } as React.CSSProperties}><div className="flex h-[184px] w-[184px] flex-col items-center justify-center rounded-full border border-cyan-100/[.09] bg-[#07101a]/90"><Sparkles className="mb-3 h-5 w-5 text-cyan-100/60" /><b className="text-5xl font-medium tracking-[-.06em]">{profile.trainingProgress}%</b><small className="mt-2 uppercase tracking-[.18em] text-white/28">identity formed</small></div></div></div></Panel><div className="mt-4 grid gap-4 md:grid-cols-3">{[["Діалоги",profile.stats.conversations],["Спогади",profile.stats.memories],["Чернетки",profile.stats.drafts]].map(([label,value]) => <Panel key={label} className="p-6"><span className="data-label">SERVER</span><p className="mt-8 text-4xl font-medium">{String(value).padStart(2,"0")}</p><p className="mt-2 text-sm">{label}</p></Panel>)}</div></motion.div>}
          {tab === "data" && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><p className="eyebrow">DRAFT ONLY</p><h1 className="mt-4 text-4xl font-medium tracking-[-.055em] sm:text-5xl">AI-відповідь як чернетка.</h1><p className="mt-3 max-w-2xl leading-7 text-white/38">Altr не відправляє повідомлення автоматично. Він генерує текст, який ти редагуєш і відправляєш сам.</p><Panel className="mt-8 p-6 sm:p-8"><label className="settings-field"><span>Встав повідомлення, на яке треба відповісти</span><textarea rows={7} value={draftMessage} onChange={e => setDraftMessage(e.target.value)} placeholder="Наприклад: клієнт питає про дедлайн, ціну або наступний крок…" /></label><button onClick={createDraft} disabled={draftMessage.trim().length < 10} className="future-button mt-6 rounded-full px-5 py-3 text-sm disabled:opacity-40">Generate draft</button></Panel></motion.div>}
          {tab === "settings" && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><p className="eyebrow">CONTROL CENTER</p><h1 className="mt-4 text-4xl font-medium tracking-[-.055em] sm:text-5xl">Налаштування.</h1><div className="mt-8 grid gap-4 xl:grid-cols-[1.1fr_.9fr]"><Panel className="p-6 sm:p-8"><h2 className="text-2xl">Профіль Altr ID</h2><p className="mt-1 text-sm text-white/30">{profile.email}</p><div className="mt-7 grid gap-5 sm:grid-cols-2"><label className="settings-field"><span>Твоє імʼя</span><input value={profile.name} onChange={e => setProfile({...profile,name:e.target.value})} /></label><label className="settings-field"><span>Назва Altr</span><input value={profile.altrName} onChange={e => setProfile({...profile,altrName:e.target.value})} /></label><label className="settings-field"><span>Роль</span><input value={profile.role} onChange={e => setProfile({...profile,role:e.target.value})} /></label><label className="settings-field"><span>Тон</span><select value={profile.tone} onChange={e => setProfile({...profile,tone:e.target.value as ToneMode})}>{Object.entries(tones).map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label><label className="settings-field sm:col-span-2"><span>Про тебе</span><textarea rows={4} value={profile.bio} onChange={e => setProfile({...profile,bio:e.target.value})} /></label></div><button onClick={async () => { await persist(profile); setSaved(true); setTimeout(()=>setSaved(false),1500); }} className="future-button mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm"><Save className="h-4 w-4" />{saved ? "Збережено" : "Зберегти"}</button></Panel><div className="space-y-4"><Panel className="p-6 sm:p-8"><span className="data-label">PRIVACY</span><h2 className="mt-3 text-2xl">Серверний контроль</h2><p className="mt-3 text-sm leading-6 text-white/38">Дані акаунта, памʼять, імпорти, чернетки і підписки не активуються з браузерного localStorage.</p><div className="mt-5 flex items-center gap-2 text-xs text-cyan-100/55"><ShieldCheck className="h-4 w-4" />Verified server state</div></Panel><Panel className="p-6"><div className="mb-5 flex items-center justify-between"><div><span className="data-label">CURRENT PLAN</span><p className="mt-2 text-lg">{planNames[profile.plan]}</p></div><Link href="/pricing" className="future-button rounded-full px-4 py-2 text-xs">Змінити план</Link></div><div className="flex flex-wrap gap-3 border-t border-white/[.06] pt-5"><button onClick={leave} className="glass-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm"><LogOut className="h-4 w-4" />Вийти</button><button onClick={remove} className="danger-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm"><Trash2 className="h-4 w-4" />Видалити акаунт</button></div></Panel></div></div></motion.div>}
        </div>
      </div>
    </main>
  );
}