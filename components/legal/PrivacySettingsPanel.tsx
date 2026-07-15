"use client";

import { Check, Cookie, Database, Download, FileText, MessageSquareText, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { type AltrProfile, getCurrentProfile } from "@/lib/auth";
import { useLang } from "@/lib/i18n/lang-store";
import { LEGAL_CONFIG } from "@/lib/legal/legal-config";
import { CookiePreferencesButton } from "./CookiePreferencesButton";

const copy = {
  EN: {
    eyebrow: "PRIVACY & DATA", title: "Control what Altr processes.", subtitle: "Consent, export and deletion controls below use server-backed records.",
    conversation: "Conversation processing", conversationBody: "Allows storage and processing of normalized conversations you explicitly approve after local browser parsing.",
    memory: "Personal AI memory", memoryBody: "Allows OpenAI-powered extraction and updates of reviewable memories from approved normalized data.",
    granted: "Granted", notGranted: "Not granted", enable: "Enable", withdraw: "Withdraw",
    effectConversation: "Withdrawal stops future imports and disconnects data connections. Existing data remains until you delete it.",
    effectMemory: "Withdrawal stops future memory learning. Existing memories remain until you clear them.",
    terms: "Terms version", privacy: "Privacy version", dataTools: "Data controls", deleteMemory: "Clear AI memory", export: "Export server data", deleteAll: "Delete account or request deletion", cookies: "Cookie preferences", deletedMemory: "AI memory cleared.", date: "Recorded", policyLinks: "Legal documents", serverNotice: "Server-backed controls", serverBody: "Supabase stores consent records, normalized approved data and account state. Raw import files remain in the browser and are not uploaded.", failed: "The requested privacy action could not be completed.",
  },
  UA: {
    eyebrow: "ПРИВАТНІСТЬ І ДАНІ", title: "Керуй тим, що обробляє Altr.", subtitle: "Згоди, експорт і видалення нижче працюють через серверні записи.",
    conversation: "Обробка переписок", conversationBody: "Дозволяє зберігати й обробляти нормалізовані переписки, які ти явно підтвердив після локального parsing у браузері.",
    memory: "Персональна AI-памʼять", memoryBody: "Дозволяє OpenAI створювати й оновлювати доступні для перегляду memories з підтверджених нормалізованих даних.",
    granted: "Надано", notGranted: "Не надано", enable: "Увімкнути", withdraw: "Відкликати",
    effectConversation: "Відкликання зупиняє майбутні імпорти та відключає data connections. Наявні дані залишаються до видалення.",
    effectMemory: "Відкликання зупиняє майбутнє навчання памʼяті. Наявні memories залишаються до очищення.",
    terms: "Версія Умов", privacy: "Версія Політики", dataTools: "Керування даними", deleteMemory: "Очистити AI-памʼять", export: "Експортувати серверні дані", deleteAll: "Видалити акаунт або подати запит", cookies: "Налаштування cookie", deletedMemory: "AI-памʼять очищено.", date: "Записано", policyLinks: "Юридичні документи", serverNotice: "Серверні privacy controls", serverBody: "Supabase зберігає записи згод, нормалізовані підтверджені дані та стан акаунта. Raw import files залишаються у браузері й не завантажуються.", failed: "Не вдалося виконати privacy-дію.",
  },
} as const;

type ConsentType = "conversation_processing" | "ai_memory";

export function PrivacySettingsPanel({ profile, onProfileChange }: { profile: AltrProfile; onProfileChange: (profile: AltrProfile) => void }) {
  const [lang] = useLang("UA");
  const t = copy[lang];
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const conversationActive = Boolean(profile.consents.conversationProcessingAcceptedAt);
  const memoryActive = Boolean(profile.consents.aiMemoryAcceptedAt);

  const refresh = async () => {
    const next = await getCurrentProfile();
    if (next) onProfileChange(next);
  };

  const toggleConsent = async (type: ConsentType, active: boolean) => {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(active ? "/api/consents/withdraw" : "/api/consents/grant", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(type === "conversation_processing" ? { conversationProcessing: true, locale: lang } : { aiMemory: true, locale: lang }),
      });
      if (!response.ok) throw new Error("CONSENT_UPDATE_FAILED");
      await refresh();
    } catch { setMessage(t.failed); } finally { setBusy(false); }
  };

  const deleteMemory = async () => {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/memories", { method: "DELETE" });
      if (!response.ok) throw new Error("MEMORY_CLEAR_FAILED");
      setMessage(t.deletedMemory); await refresh();
    } catch { setMessage(t.failed); } finally { setBusy(false); }
  };

  return <div>
    <p className="eyebrow">{t.eyebrow}</p><h1 className="mt-4 text-4xl font-medium tracking-[-.055em] sm:text-5xl">{t.title}</h1><p className="mt-3 max-w-2xl leading-7 text-white/38">{t.subtitle}</p>
    {message && <div className="mt-6 flex items-center gap-3 rounded-xl border border-cyan-100/[.09] bg-cyan-200/[.035] px-4 py-3 text-sm text-cyan-50/65"><Check className="h-4 w-4" />{message}</div>}
    <div className="mt-8 grid gap-4 xl:grid-cols-2">
      <ConsentCard icon={<MessageSquareText className="h-5 w-5" />} title={t.conversation} description={t.conversationBody} effect={t.effectConversation} active={conversationActive} recordedAt={profile.consents.conversationProcessingAcceptedAt} onToggle={() => void toggleConsent("conversation_processing", conversationActive)} disabled={busy} labels={t} />
      <ConsentCard icon={<Database className="h-5 w-5" />} title={t.memory} description={t.memoryBody} effect={t.effectMemory} active={memoryActive} recordedAt={profile.consents.aiMemoryAcceptedAt} onToggle={() => void toggleConsent("ai_memory", memoryActive)} disabled={busy} labels={t} />
    </div>
    <div className="mt-4 grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
      <section className="dashboard-panel rounded-[1.65rem] p-6 sm:p-8"><span className="data-label">POLICY VERSIONS</span><h2 className="mt-3 text-2xl">{t.policyLinks}</h2><div className="mt-6 space-y-4"><PolicyRow label={t.terms} version={LEGAL_CONFIG.TERMS_VERSION} recordedAt={profile.consents.termsAcceptedAt} href="/terms" /><PolicyRow label={t.privacy} version={LEGAL_CONFIG.PRIVACY_POLICY_VERSION} recordedAt={profile.consents.termsAcceptedAt} href="/privacy" /></div><div className="mt-6 flex flex-wrap gap-3 border-t border-white/[.06] pt-5"><Link href="/cookies" className="glass-button rounded-full px-4 py-2.5 text-xs">Cookie Policy</Link><Link href="/data-deletion" className="glass-button rounded-full px-4 py-2.5 text-xs">Data Deletion</Link></div></section>
      <section className="dashboard-panel rounded-[1.65rem] p-6 sm:p-8"><span className="data-label">DATA ACTIONS</span><h2 className="mt-3 text-2xl">{t.dataTools}</h2><div className="mt-6 grid gap-3 sm:grid-cols-2"><button disabled={busy} type="button" onClick={() => void deleteMemory()} className="privacy-action"><Trash2 className="h-4 w-4" />{t.deleteMemory}</button><a href="/api/privacy/export" className="privacy-action"><Download className="h-4 w-4" />{t.export}</a><CookiePreferencesButton className="privacy-action"><Cookie className="h-4 w-4" />{t.cookies}</CookiePreferencesButton><Link href="/data-deletion/request" className="privacy-action"><MessageSquareText className="h-4 w-4" />Privacy request</Link></div><Link href="/delete-data" className="danger-button mt-4 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm"><Trash2 className="h-4 w-4" />{t.deleteAll}</Link></section>
    </div>
    <section className="mt-4 flex gap-4 rounded-[1.45rem] border border-amber-200/[.08] bg-amber-200/[.025] p-5 text-sm leading-6 text-white/40"><ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-amber-100/45" /><div><strong className="text-white/65">{t.serverNotice}</strong><p className="mt-1">{t.serverBody}</p></div></section>
  </div>;
}

function ConsentCard({ icon, title, description, effect, active, recordedAt, onToggle, disabled, labels }: { icon: React.ReactNode; title: string; description: string; effect: string; active: boolean; recordedAt: string; onToggle: () => void; disabled: boolean; labels: typeof copy.EN | typeof copy.UA }) {
  return <section className="dashboard-panel rounded-[1.65rem] p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-100/[.09] bg-cyan-200/[.035] text-cyan-100/55">{icon}</span><span className={`consent-status ${active ? "consent-status-active" : ""}`}>{active ? labels.granted : labels.notGranted}</span></div><h2 className="mt-6 text-2xl">{title}</h2><p className="mt-3 text-sm leading-6 text-white/38">{description}</p><p className="mt-4 text-xs leading-5 text-white/27">{effect}</p><div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/[.06] pt-5"><span className="text-[11px] text-white/28">{labels.date}: {recordedAt ? new Date(recordedAt).toLocaleString() : "—"}</span><button disabled={disabled} type="button" onClick={onToggle} className={active ? "glass-button rounded-full px-4 py-2 text-xs" : "future-button rounded-full px-4 py-2 text-xs"}>{active ? labels.withdraw : labels.enable}</button></div></section>;
}

function PolicyRow({ label, version, recordedAt, href }: { label: string; version: string; recordedAt: string; href: string }) {
  return <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[.055] bg-black/15 p-4"><div><p className="text-sm text-white/72">{label}</p><p className="mt-1 text-xs text-white/28">{version} · {recordedAt ? new Date(recordedAt).toLocaleDateString() : "not recorded"}</p></div><Link href={href} aria-label={label} className="profile-action"><FileText className="h-4 w-4" /></Link></div>;
}