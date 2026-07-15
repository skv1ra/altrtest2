"use client";

import { AlertTriangle, ArrowLeft, Check, Download, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AiMark } from "@/components/Navigation";
import { getCurrentProfile } from "@/lib/auth";
import { legalConfig } from "@/lib/legal";

type Scope = "all" | "account" | "conversations" | "memory";

export default function DeletionRequestPage() {
  const [email, setEmail] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState("");

  useEffect(() => {
    let active = true;
    getCurrentProfile().then((profile) => {
      if (!active || !profile?.email) return;
      setEmail(profile.email);
      setAuthenticated(true);
    });
    return () => { active = false; };
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/privacy/deletion-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, scope, reason, confirmed }),
      });
      const payload = await response.json() as { reference?: string; error?: string };
      if (!response.ok || !payload.reference) throw new Error(payload.error || "Не вдалося подати запит.");
      setRequestId(payload.reference);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не вдалося подати запит.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAccount = async () => {
    setError("");
    if (deletePhrase !== "DELETE MY ACCOUNT") {
      setError("Введіть точну фразу DELETE MY ACCOUNT.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/privacy/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, confirmation: deletePhrase, reason }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Видалення не завершено.");
      window.location.assign("/");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Видалення не завершено.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05080c] text-white">
      <div className="account-grid pointer-events-none fixed inset-0" />
      <header className="relative z-20 mx-auto flex h-24 max-w-5xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 font-semibold">Altr <AiMark /></Link>
        <Link href="/data-deletion" className="inline-flex items-center gap-2 text-xs uppercase tracking-[.16em] text-white/42"><ArrowLeft className="h-4 w-4" />Data Deletion</Link>
      </header>

      <div className="relative z-10 mx-auto grid max-w-5xl gap-10 px-5 pb-24 pt-8 lg:grid-cols-[.8fr_1.2fr]">
        <section>
          <p className="eyebrow">PRIVACY REQUEST</p>
          <h1 className="mt-5 text-5xl font-medium leading-[.98] tracking-[-.06em]">Ваші дані під вашим контролем.</h1>
          <p className="mt-6 leading-7 text-white/42">Запит тепер записується на сервері. Публічна форма не повідомляє, чи існує акаунт із введеним email.</p>
          <div className="mt-8 rounded-[1.4rem] border border-cyan-100/[.08] bg-white/[.025] p-5 text-sm leading-6 text-white/36"><ShieldCheck className="mb-3 h-5 w-5 text-cyan-100/50" />Для повного видалення акаунта потрібно повторно увійти нещодавно та ввести точну фразу підтвердження.</div>
          {authenticated && <div className="mt-6 space-y-3"><a className="future-button flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm" href="/api/privacy/export"><Download className="h-4 w-4" />Завантажити JSON</a><a className="future-button flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm" href="/api/privacy/export?format=csv"><Download className="h-4 w-4" />Завантажити CSV ZIP</a></div>}
        </section>

        <section className="auth-card rounded-[2rem] p-6 sm:p-8">
          {requestId ? <div className="py-10 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-100/15 bg-cyan-200/[.06]"><Check className="h-6 w-6 text-cyan-100" /></span><h2 className="mt-6 text-3xl font-medium">Запит зафіксовано</h2><p className="mt-3 text-sm leading-6 text-white/40">Номер: <strong className="text-white/70">{requestId}</strong>. Подальша перевірка не розкриватиме наявність акаунта стороннім.</p></div> : <form onSubmit={submit} className="space-y-5" noValidate>
            <div><p className="eyebrow">DELETE REQUEST</p><h2 className="mt-3 text-3xl font-medium tracking-[-.04em]">Новий запит</h2></div>
            <label className="settings-field"><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" /></label>
            <label className="settings-field"><span>Що видалити</span><select value={scope} onChange={(event) => setScope(event.target.value as Scope)}><option value="all">Усі дані та акаунт</option><option value="account">Акаунт і профіль</option><option value="conversations">Переписки та чернетки</option><option value="memory">AI-памʼять</option></select></label>
            <label className="settings-field"><span>Коментар — необовʼязково</span><textarea rows={4} value={reason} onChange={(event) => setReason(event.target.value)} /></label>
            <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-white/42"><input className="sr-only" type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span className={`checkbox-visual ${confirmed ? "checkbox-visual-active" : ""}`}>{confirmed && <Check className="h-3 w-3" />}</span><span>Я підтверджую, що запит стосується моїх даних.</span></label>
            <button disabled={submitting} className="danger-button flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm"><Trash2 className="h-4 w-4" />{submitting ? "Обробка…" : "Подати серверний запит"}</button>
          </form>}

          {authenticated && !requestId && <div className="mt-8 border-t border-white/10 pt-8"><h3 className="text-xl font-medium">Негайно видалити акаунт</h3><p className="mt-2 text-xs leading-5 text-white/38">Спочатку повторно увійдіть, якщо останній вхід був понад 15 хвилин тому. Введіть DELETE MY ACCOUNT.</p><input className="mt-4 w-full rounded-xl border border-red-300/10 bg-black/20 px-4 py-3 text-sm" value={deletePhrase} onChange={(event) => setDeletePhrase(event.target.value)} placeholder="DELETE MY ACCOUNT" /><button type="button" disabled={submitting} onClick={deleteAccount} className="danger-button mt-4 flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm"><AlertTriangle className="h-4 w-4" />Безповоротно видалити</button></div>}
          {error && <p role="alert" className="mt-5 rounded-xl border border-red-300/10 bg-red-400/[.06] px-4 py-3 text-sm text-red-100/75">{error}</p>}
          <p className="mt-5 text-xs text-white/30">Privacy contact: {legalConfig.privacyEmail}</p>
        </section>
      </div>
    </main>
  );
}
