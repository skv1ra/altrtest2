"use client";

import { AlertTriangle, ArrowLeft, Check, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AiMark } from "@/components/Navigation";
import { deleteCurrentAccount, getCurrentProfile, updateCurrentProfile } from "@/lib/auth";
import { deleteAllConversationImports } from "@/lib/conversationImports";
import { legalConfig } from "@/lib/legal";

type Scope = "all" | "account" | "conversations" | "memory";

export default function DeletionRequestPage() {
  const [email, setEmail] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState("");

  useEffect(() => { const profile = getCurrentProfile(); if (profile) setEmail(profile.email); }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Вкажіть коректну email-адресу.");
    if (!confirmed) return setError("Підтвердьте, що розумієте наслідки видалення.");

    const id = `DEL-${Date.now().toString(36).toUpperCase()}`;
    const record = { id, email: email.trim().toLowerCase(), scope, reason: reason.trim(), createdAt: new Date().toISOString(), status: "submitted" };
    const previous = JSON.parse(localStorage.getItem("altr_deletion_requests_v1") ?? "[]") as unknown[];
    localStorage.setItem("altr_deletion_requests_v1", JSON.stringify([...previous, record]));

    const profile = getCurrentProfile();
    if (profile?.email.toLowerCase() === record.email) {
      if (scope === "all" || scope === "account") deleteCurrentAccount();
      if (scope === "conversations") { deleteAllConversationImports(profile.id); updateCurrentProfile({ stats: { ...profile.stats, conversations: 0, drafts: 0 } }); }
      if (scope === "memory") updateCurrentProfile({ trainingProgress: 0, stats: { ...profile.stats, memories: 0 } });
    }
    setRequestId(id);
  };

  return <main className="relative min-h-screen overflow-hidden bg-[#05080c] text-white">
    <div className="account-grid pointer-events-none fixed inset-0" /><div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_75%_8%,rgba(47,160,255,.12),transparent_30%)]" />
    <header className="relative z-20 mx-auto flex h-24 max-w-5xl items-center justify-between px-5"><Link href="/" className="flex items-center gap-2 font-semibold">Altr <AiMark /></Link><Link href="/data-deletion" className="inline-flex items-center gap-2 text-xs uppercase tracking-[.16em] text-white/42"><ArrowLeft className="h-4 w-4" />Data Deletion</Link></header>
    <div className="relative z-10 mx-auto grid max-w-5xl gap-10 px-5 pb-24 pt-8 lg:grid-cols-[.8fr_1.2fr]">
      <section><p className="eyebrow">PRIVACY REQUEST</p><h1 className="mt-5 text-5xl font-medium leading-[.98] tracking-[-.06em]">Видалити мої дані.</h1><p className="mt-6 leading-7 text-white/42">Запит доступний з акаунтом або без нього. Для захисту від зловживань ми можемо перевірити, що email належить вам.</p><div className="mt-8 rounded-[1.4rem] border border-cyan-100/[.08] bg-white/[.025] p-5 text-sm leading-6 text-white/36"><ShieldCheck className="mb-3 h-5 w-5 text-cyan-100/50" />Дані перевірки особи мають використовуватися лише для виконання запиту й видалятися після завершення.</div></section>
      <section className="auth-card rounded-[2rem] p-6 sm:p-8">
        {requestId ? <div className="py-10 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-100/15 bg-cyan-200/[.06]"><Check className="h-6 w-6 text-cyan-100" /></span><h2 className="mt-6 text-3xl font-medium">Запит зафіксовано</h2><p className="mt-3 text-sm leading-6 text-white/40">Номер: <strong className="text-white/70">{requestId}</strong>. Локальні дані вибраної категорії видалено, якщо email збігся з активним акаунтом.</p><div className="legal-warning mt-6 text-left"><AlertTriangle className="h-5 w-5 flex-none" /><p>До запуску серверної обробки цей запит зберігається лише у браузері. Підключіть endpoint або використайте privacy email: {legalConfig.privacyEmail}</p></div><Link href="/" className="future-button mt-7 inline-flex rounded-full px-5 py-3 text-sm">Повернутися на головну</Link></div> : <form onSubmit={submit} className="space-y-5" noValidate>
          <div><p className="eyebrow">DELETE REQUEST</p><h2 className="mt-3 text-3xl font-medium tracking-[-.04em]">Новий запит</h2></div>
          <label className="settings-field"><span>Email акаунта</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" /></label>
          <label className="settings-field"><span>Що видалити</span><select value={scope} onChange={e=>setScope(e.target.value as Scope)}><option value="all">Усі дані та акаунт</option><option value="account">Лише акаунт і профіль</option><option value="conversations">Переписки та чернетки</option><option value="memory">Персональну AI-памʼять</option></select></label>
          <label className="settings-field"><span>Коментар — необовʼязково</span><textarea rows={4} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Додаткова інформація для перевірки запиту" /></label>
          <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-white/42"><input className="sr-only" type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} /><span className={`checkbox-visual ${confirmed ? "checkbox-visual-active" : ""}`}>{confirmed && <Check className="h-3 w-3" />}</span><span>Я підтверджую, що цей запит стосується моїх даних, і розумію, що видалення може бути незворотним та припинити доступ до Altr.</span></label>
          {error && <p role="alert" className="rounded-xl border border-red-300/10 bg-red-400/[.06] px-4 py-3 text-sm text-red-100/75">{error}</p>}
          <button className="danger-button flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm"><Trash2 className="h-4 w-4" />Подати запит на видалення</button>
        </form>}
      </section>
    </div>
  </main>;
}
