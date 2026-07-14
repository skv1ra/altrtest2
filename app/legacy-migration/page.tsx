"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { updateCurrentProfile } from "@/lib/auth";

const DONE_KEY = "altr_legacy_migration_completed_v1";
const LEGACY_PATTERN = /^(altr|altr_|altr-)/i;
type LegacyEntry = { key: string; value: unknown; raw: string };

function collectLegacyEntries(): LegacyEntry[] {
  const entries: LegacyEntry[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || key === DONE_KEY || !LEGACY_PATTERN.test(key)) continue;
    const raw = localStorage.getItem(key) ?? "";
    try { entries.push({ key, value: JSON.parse(raw), raw }); }
    catch { entries.push({ key, value: raw, raw }); }
  }
  return entries;
}

export default function LegacyMigrationPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<LegacyEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { setEntries(collectLegacyEntries()); }, []);

  const safeProfile = useMemo(() => {
    const objects = entries.map((entry) => entry.value).filter((value): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value)));
    const source = objects.find((value) => value.name || value.altrName || value.tone || value.preferences) ?? {};
    return {
      name: typeof source.name === "string" ? source.name.slice(0, 80) : undefined,
      altrName: typeof source.altrName === "string" ? source.altrName.slice(0, 80) : undefined,
      bio: typeof source.bio === "string" ? source.bio.slice(0, 1000) : undefined,
      tone: ["balanced", "warm", "direct", "formal"].includes(String(source.tone)) ? source.tone : undefined,
      preferences: source.preferences && typeof source.preferences === "object" ? source.preferences : undefined,
    };
  }, [entries]);

  async function finish() {
    const response = await fetch("/api/auth/legacy-migration/complete", { method: "POST" });
    if (!response.ok) throw new Error("MIGRATION_COMPLETION_FAILED");
    localStorage.setItem(DONE_KEY, "true");
    router.replace("/dashboard");
    router.refresh();
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), entries }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `altr-legacy-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function migrateSafeData() {
    setBusy(true);
    setMessage("");
    try {
      await updateCurrentProfile(Object.fromEntries(Object.entries(safeProfile).filter(([, value]) => value !== undefined)));
      entries.forEach((entry) => localStorage.removeItem(entry.key));
      await finish();
    } catch {
      setMessage("Не вдалося перенести профіль. Експортуй JSON і спробуй пізніше.");
    } finally { setBusy(false); }
  }

  async function deleteLocalData() {
    setBusy(true);
    try {
      entries.forEach((entry) => localStorage.removeItem(entry.key));
      await finish();
    } catch {
      setMessage("Не вдалося завершити очищення. Спробуй ще раз.");
    } finally { setBusy(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05080c] px-5 py-12 text-white">
      <section className="auth-card w-full max-w-2xl rounded-[2rem] p-7 sm:p-10">
        <p className="eyebrow">ONE-TIME MIGRATION</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-.05em]">Локальні дані прототипу</h1>
        <p className="mt-4 leading-7 text-white/45">Знайдено {entries.length} старих локальних записів. Паролі не читаються і не переносяться. Локальні тарифи, платежі та підписки не є доказом оплати й не можуть бути перенесені.</p>
        {entries.length > 0 ? <div className="mt-6 max-h-48 overflow-auto rounded-2xl border border-white/[.07] bg-black/20 p-4 text-sm text-white/55">{entries.map((entry) => <div key={entry.key} className="border-b border-white/[.05] py-2 last:border-0">{entry.key}</div>)}</div> : <p className="mt-6 rounded-2xl border border-white/[.07] bg-white/[.03] p-4 text-sm text-white/55">Старих даних не знайдено. Можна продовжити.</p>}
        {message && <p role="alert" className="mt-4 text-sm text-red-100/75">{message}</p>}
        <div className="mt-8 flex flex-wrap gap-3">
          {entries.length > 0 && <button onClick={exportJson} className="glass-button rounded-full px-5 py-3 text-sm">Експортувати JSON</button>}
          {entries.length > 0 && <button disabled={busy} onClick={migrateSafeData} className="future-button rounded-full px-5 py-3 text-sm disabled:opacity-60">Перенести безпечний профіль</button>}
          {entries.length > 0 && <button disabled={busy} onClick={deleteLocalData} className="danger-button rounded-full px-5 py-3 text-sm disabled:opacity-60">Видалити локально</button>}
          {entries.length === 0 && <button disabled={busy} onClick={() => { setBusy(true); finish().catch(() => setMessage("Не вдалося завершити перевірку.")).finally(() => setBusy(false)); }} className="future-button rounded-full px-5 py-3 text-sm disabled:opacity-60">Продовжити</button>}
        </div>
      </section>
    </main>
  );
}
