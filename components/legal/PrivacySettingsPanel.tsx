"use client";

import { Check, Cookie, Database, Download, FileText, MessageSquareText, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { type AltrProfile, updateCurrentProfile } from "@/lib/auth";
import { useLang } from "@/lib/i18n/lang-store";
import { getConsentRecords, getCurrentConsent, hasValidConsent, recordConsent, withdrawConsent } from "@/lib/legal/consent-store";
import { LEGAL_CONFIG } from "@/lib/legal/legal-config";
import { exportLocalAltrData } from "@/lib/legal/privacy-data";
import { CookiePreferencesButton } from "./CookiePreferencesButton";

const copy = {
  EN: {
    eyebrow: "PRIVACY & DATA", title: "Control what Altr learns.", subtitle: "Review consent, stop future processing, remove local prototype data, or export what this browser stores.",
    conversation: "Conversation processing", conversationBody: "Allows Altr to process chats, email, and connected messages you choose to import in order to analyze tone, context, and response patterns.",
    memory: "Personal AI memory", memoryBody: "Allows Altr to create and update derived memory, communication patterns, preferences, context, routines, and inferred profile information.",
    granted: "Granted", notGranted: "Not granted", enable: "Enable", withdraw: "Withdraw", effectConversation: "Withdrawing stops future imports and disconnects local prototype sources.", effectMemory: "Withdrawing stops future AI-memory updates. Existing local memory remains until you delete it.",
    terms: "Terms version", privacy: "Privacy version", dataTools: "Data controls", deleteMemory: "Delete AI memory", deleteConversations: "Delete imported conversation data", export: "Export available local data", deleteAll: "Request complete deletion", cookies: "Cookie preferences", deletedMemory: "Local AI-memory demo data deleted.", deletedConversations: "Local conversation demo data deleted and sources disconnected.",
    prototype: "Prototype notice", prototypeBody: "Accounts, consent records, and dashboard data are stored in localStorage in this build. Production consent logging and deletion require a server-side database, verified email workflow, and provider deletion jobs.", date: "Recorded", policyLinks: "Legal documents",
  },
  UA: {
    eyebrow: "ПРИВАТНІСТЬ І ДАНІ", title: "Керуй тим, чого навчається Altr.", subtitle: "Переглядай згоди, зупиняй майбутню обробку, видаляй локальні прототипні дані або експортуй те, що зберігається в цьому браузері.",
    conversation: "Обробка переписок", conversationBody: "Дозволяє Altr обробляти чати, email і підключені повідомлення, які ти вирішуєш імпортувати, для аналізу тону, контексту та моделей відповідей.",
    memory: "Персональна AI-памʼять", memoryBody: "Дозволяє Altr створювати й оновлювати похідну памʼять, патерни спілкування, уподобання, контекст, звички та виведену профільну інформацію.",
    granted: "Надано", notGranted: "Не надано", enable: "Увімкнути", withdraw: "Відкликати", effectConversation: "Відкликання зупиняє майбутні імпорти й відключає локальні прототипні джерела.", effectMemory: "Відкликання зупиняє майбутні оновлення AI-памʼяті. Наявна локальна памʼять залишається, доки ти її не видалиш.",
    terms: "Версія Умов", privacy: "Версія Політики", dataTools: "Керування даними", deleteMemory: "Видалити AI-памʼять", deleteConversations: "Видалити імпортовані переписки", export: "Експортувати доступні локальні дані", deleteAll: "Запросити повне видалення", cookies: "Налаштування cookie", deletedMemory: "Локальні демонстраційні дані AI-памʼяті видалено.", deletedConversations: "Локальні демонстраційні дані переписок видалено, джерела відключено.",
    prototype: "Повідомлення про прототип", prototypeBody: "У цій збірці акаунти, записи згод і дані кабінету зберігаються в localStorage. Для production потрібні серверна база, перевірка через email і задачі видалення у провайдерів.", date: "Записано", policyLinks: "Юридичні документи",
  },
} as const;

export function PrivacySettingsPanel({ profile, onProfileChange }: { profile: AltrProfile; onProfileChange: (profile: AltrProfile) => void }) {
  const [lang] = useLang("UA");
  const t = copy[lang];
  const [revision, setRevision] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => { const update = () => setRevision((value) => value + 1); window.addEventListener("altr-consent-change", update); return () => window.removeEventListener("altr-consent-change", update); }, []);

  const consentState = useMemo(() => {
    void revision;
    return {
      conversation: getCurrentConsent(profile.id, "conversation_processing"), memory: getCurrentConsent(profile.id, "ai_memory"),
      terms: getCurrentConsent(profile.id, "terms"), privacy: getCurrentConsent(profile.id, "privacy_acknowledgement"),
    };
  }, [profile.id, revision]);

  const applyProfile = (update: Partial<AltrProfile>) => { const next = updateCurrentProfile(update); if (next) onProfileChange(next); };

  const toggleConsent = (type: "conversation_processing" | "ai_memory") => {
    const active = hasValidConsent(profile.id, type);
    if (active) {
      withdrawConsent({ userId: profile.id, consentType: type, locale: lang, source: "settings" });
      if (type === "conversation_processing") applyProfile({ connections: { email: false, calendar: false, messages: false, workspace: false } });
      else applyProfile({ preferences: { ...profile.preferences, learning: false } });
    } else {
      recordConsent({ userId: profile.id, consentType: type, granted: true, source: "settings", locale: lang });
      if (type === "ai_memory") applyProfile({ preferences: { ...profile.preferences, learning: true } });
    }
    setRevision((value) => value + 1);
  };

  const deleteMemory = () => { applyProfile({ trainingProgress: 0, stats: { ...profile.stats, memories: 0 } }); setMessage(t.deletedMemory); };
  const deleteConversations = () => { applyProfile({ stats: { ...profile.stats, conversations: 0 }, connections: { email: false, calendar: false, messages: false, workspace: false } }); setMessage(t.deletedConversations); };
  const exportData = () => {
    const payload = exportLocalAltrData(); const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `altr-export-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url);
  };

  return (
    <div>
      <p className="eyebrow">{t.eyebrow}</p><h1 className="mt-4 text-4xl font-medium tracking-[-.055em] sm:text-5xl">{t.title}</h1><p className="mt-3 max-w-2xl leading-7 text-white/38">{t.subtitle}</p>
      {message && <div className="mt-6 flex items-center gap-3 rounded-xl border border-cyan-100/[.09] bg-cyan-200/[.035] px-4 py-3 text-sm text-cyan-50/65"><Check className="h-4 w-4" />{message}</div>}
      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <ConsentCard icon={<MessageSquareText className="h-5 w-5" />} title={t.conversation} description={t.conversationBody} effect={t.effectConversation} record={consentState.conversation} active={consentState.conversation?.granted === true} onToggle={() => toggleConsent("conversation_processing")} labels={t} />
        <ConsentCard icon={<Database className="h-5 w-5" />} title={t.memory} description={t.memoryBody} effect={t.effectMemory} record={consentState.memory} active={consentState.memory?.granted === true} onToggle={() => toggleConsent("ai_memory")} labels={t} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
        <section className="dashboard-panel rounded-[1.65rem] p-6 sm:p-8"><span className="data-label">POLICY VERSIONS</span><h2 className="mt-3 text-2xl">{t.policyLinks}</h2><div className="mt-6 space-y-4"><PolicyRow label={t.terms} version={LEGAL_CONFIG.TERMS_VERSION} record={consentState.terms} href="/terms" /><PolicyRow label={t.privacy} version={LEGAL_CONFIG.PRIVACY_POLICY_VERSION} record={consentState.privacy} href="/privacy" /></div><div className="mt-6 flex flex-wrap gap-3 border-t border-white/[.06] pt-5"><Link href="/cookies" className="glass-button rounded-full px-4 py-2.5 text-xs">Cookie Policy</Link><Link href="/data-deletion" className="glass-button rounded-full px-4 py-2.5 text-xs">Data Deletion</Link></div></section>
        <section className="dashboard-panel rounded-[1.65rem] p-6 sm:p-8"><span className="data-label">DATA ACTIONS</span><h2 className="mt-3 text-2xl">{t.dataTools}</h2><div className="mt-6 grid gap-3 sm:grid-cols-2"><button type="button" onClick={deleteMemory} className="privacy-action"><Trash2 className="h-4 w-4" />{t.deleteMemory}</button><button type="button" onClick={deleteConversations} className="privacy-action"><MessageSquareText className="h-4 w-4" />{t.deleteConversations}</button><button type="button" onClick={exportData} className="privacy-action"><Download className="h-4 w-4" />{t.export}</button><CookiePreferencesButton className="privacy-action"><Cookie className="h-4 w-4" />{t.cookies}</CookiePreferencesButton></div><Link href="/delete-data" className="danger-button mt-4 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm"><Trash2 className="h-4 w-4" />{t.deleteAll}</Link></section>
      </div>
      <section className="mt-4 flex gap-4 rounded-[1.45rem] border border-amber-200/[.08] bg-amber-200/[.025] p-5 text-sm leading-6 text-white/40"><ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-amber-100/45" /><div><strong className="text-white/65">{t.prototype}</strong><p className="mt-1">{t.prototypeBody}</p></div></section>
    </div>
  );
}

function ConsentCard({ icon, title, description, effect, record, active, onToggle, labels }: { icon: React.ReactNode; title: string; description: string; effect: string; record: ReturnType<typeof getCurrentConsent>; active: boolean; onToggle: () => void; labels: typeof copy.EN | typeof copy.UA }) {
  return <section className="dashboard-panel rounded-[1.65rem] p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-100/[.09] bg-cyan-200/[.035] text-cyan-100/55">{icon}</span><span className={`consent-status ${active ? "consent-status-active" : ""}`}>{active ? labels.granted : labels.notGranted}</span></div><h2 className="mt-6 text-2xl">{title}</h2><p className="mt-3 text-sm leading-6 text-white/38">{description}</p><p className="mt-4 text-xs leading-5 text-white/27">{effect}</p><div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/[.06] pt-5"><span className="text-[11px] text-white/28">{labels.date}: {record ? new Date(record.timestamp).toLocaleString() : "—"}</span><button type="button" onClick={onToggle} className={active ? "glass-button rounded-full px-4 py-2 text-xs" : "future-button rounded-full px-4 py-2 text-xs"}>{active ? labels.withdraw : labels.enable}</button></div></section>;
}

function PolicyRow({ label, version, record, href }: { label: string; version: string; record: ReturnType<typeof getCurrentConsent>; href: string }) {
  return <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[.055] bg-black/15 p-4"><div><p className="text-sm text-white/72">{label}</p><p className="mt-1 text-xs text-white/28">{version} · {record?.granted ? new Date(record.timestamp).toLocaleDateString() : "not recorded"}</p></div><Link href={href} aria-label={label} className="profile-action"><FileText className="h-4 w-4" /></Link></div>;
}
