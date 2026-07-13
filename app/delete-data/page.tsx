"use client";

import { ArrowLeft, Check, FileDown, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AiMark } from "@/components/Navigation";
import { LanguageSwitch } from "@/components/legal/LanguageSwitch";
import { getCurrentProfile, type AltrProfile } from "@/lib/auth";
import { getStoredLanguage, type Lang } from "@/lib/i18n/lang-store";
import { createDeletionRequest, deleteAllLocalAltrData, type DeletionRequest } from "@/lib/legal/privacy-data";

const copy = {
  EN: {
    eyebrow: "PRIVACY REQUEST",
    title: "Delete your Altr data.",
    subtitle: "Review the scope carefully. This prototype records requests locally while production deletion workflows are connected.",
    signedTitle: "Signed-in deletion request",
    signedBody: "You are signed in as",
    irreversible: "This action is irreversible in this browser.",
    typeWord: "Type DELETE to confirm",
    finalCheck: "I understand that selected Altr data may be permanently removed.",
    deleteButton: "Create deletion request",
    cancel: "Cancel and return to dashboard",
    externalTitle: "Cannot access your account?",
    externalBody: "Create a privacy request for verification.",
    name: "Full name",
    email: "Account email",
    requestType: "Request type",
    all: "Account and all data",
    conversations: "Imported conversations",
    memory: "Personal AI memory",
    other: "Other privacy request",
    explanation: "Details",
    contact: "Altr may contact me at this email only to verify and process this request.",
    prepare: "Create local request record",
    reference: "Reference",
    status: "Status",
    verification: "Pending verification",
    completed: "Completed locally",
    created: "Local request created",
    createdBody: "Save this reference. The production privacy workflow will be connected later.",
    deleted: "Local Altr data deleted",
    deletedBody: "Local Altr data in this browser was removed where applicable.",
    errorConfirmation: "Type DELETE and select the final confirmation checkbox.",
    errorExternal: "Enter a valid email and agree to be contacted for verification.",
    back: "Back to Altr",
    info: "Read Data Deletion information",
  },
  UA: {
    eyebrow: "PRIVACY-ЗАПИТ",
    title: "Видали свої дані Altr.",
    subtitle: "Уважно перевір обсяг. У прототипі запит фіксується локально, production-видалення підключається окремо.",
    signedTitle: "Запит на видалення з акаунта",
    signedBody: "Ти увійшов як",
    irreversible: "Цю дію не можна скасувати в цьому браузері.",
    typeWord: "Введи ВИДАЛИТИ для підтвердження",
    finalCheck: "Я розумію, що вибрані дані Altr можуть бути видалені назавжди.",
    deleteButton: "Створити запит на видалення",
    cancel: "Скасувати й повернутися в кабінет",
    externalTitle: "Немає доступу до акаунта?",
    externalBody: "Створи privacy-запит для перевірки.",
    name: "Повне імʼя",
    email: "Email акаунта",
    requestType: "Тип запиту",
    all: "Акаунт і всі дані",
    conversations: "Імпортовані переписки",
    memory: "Персональна AI-памʼять",
    other: "Інший privacy-запит",
    explanation: "Деталі",
    contact: "Altr може звʼязатися зі мною на цей email лише для перевірки й обробки запиту.",
    prepare: "Створити локальний запис запиту",
    reference: "Номер",
    status: "Статус",
    verification: "Очікує перевірки",
    completed: "Виконано локально",
    created: "Локальний запит створено",
    createdBody: "Збережи цей номер. Production privacy workflow буде підключений пізніше.",
    deleted: "Локальні дані Altr видалено",
    deletedBody: "Локальні дані Altr у цьому браузері видалені, де це застосовно.",
    errorConfirmation: "Введи ВИДАЛИТИ та постав фінальну галочку підтвердження.",
    errorExternal: "Вкажи коректний email і погодься на контакт для перевірки.",
    back: "Назад до Altr",
    info: "Прочитати про видалення даних",
  },
} as const;

export default function DeleteDataPage() {
  const [lang, setLang] = useState<Lang>("EN");
  const [profile, setProfile] = useState<AltrProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ request: DeletionRequest; deleted: boolean } | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [requestType, setRequestType] = useState<DeletionRequest["requestType"]>("account_and_all_data");
  const [explanation, setExplanation] = useState("");
  const [contactConsent, setContactConsent] = useState(false);
  const t = copy[lang];

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      const stored = getStoredLanguage();
      const currentProfile = await getCurrentProfile();
      if (!mounted) return;
      setLang(stored);
      setProfile(currentProfile);
      setReady(true);
    }
    void loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const deleteSignedInData = () => {
    if (!profile) return;
    const expected = lang === "UA" ? "ВИДАЛИТИ" : "DELETE";
    if (confirmation.trim().toUpperCase() !== expected || !confirmed) {
      setError(t.errorConfirmation);
      return;
    }
    const request = createDeletionRequest({
      userId: profile.id,
      email: profile.email,
      fullName: profile.name,
      requestType: "account_and_all_data",
      explanation: "Authenticated local prototype deletion",
      source: "authenticated-prototype",
    });
    deleteAllLocalAltrData();
    setProfile(null);
    setResult({ request: { ...request, status: "completed" }, deleted: true });
    setError("");
  };

  const submitExternal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email) || !contactConsent) {
      setError(t.errorExternal);
      return;
    }
    const request = createDeletionRequest({
      email: email.trim().toLowerCase(),
      fullName: fullName.trim() || undefined,
      requestType,
      explanation: explanation.trim() || undefined,
      source: "external-prototype",
    });
    setResult({ request, deleted: false });
    setError("");
  };

  return (
    <main className="delete-page relative min-h-screen overflow-hidden bg-[#05080c] text-white selection:bg-cyan-200 selection:text-black">
      <div className="legal-page-grid pointer-events-none fixed inset-0" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_78%_8%,rgba(47,160,255,.12),transparent_31%),radial-gradient(circle_at_15%_70%,rgba(103,232,249,.04),transparent_32%)]" />
      <header className="relative z-20 mx-auto flex h-24 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">Altr <AiMark /></Link>
        <div className="flex items-center gap-5">
          <LanguageSwitch lang={lang} onChange={setLang} />
          <Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[.14em] text-white/35 transition hover:text-white"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">{t.back}</span></Link>
        </div>
      </header>

      <section className={`relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-10 transition-opacity md:px-8 md:pt-16 ${ready ? "opacity-100" : "opacity-0"}`}>
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="mt-6 max-w-4xl text-balance text-5xl font-medium leading-[.98] tracking-[-.065em] md:text-7xl">{t.title}</h1>
        <p className="mt-7 max-w-3xl text-base leading-7 text-white/46 md:text-lg">{t.subtitle}</p>
        <Link href="/data-deletion" className="legal-inline-link mt-5 inline-flex text-sm">{t.info} →</Link>

        {result ? (
          <section className="delete-result mt-12">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full border ${result.deleted ? "border-emerald-200/20 bg-emerald-300/[.08] text-emerald-100" : "border-cyan-100/20 bg-cyan-200/[.07] text-cyan-100"}`}>{result.deleted ? <Check className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}</div>
            <h2 className="mt-6 text-3xl font-medium tracking-[-.045em]">{result.deleted ? t.deleted : t.created}</h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/45">{result.deleted ? t.deletedBody : t.createdBody}</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2"><div className="legal-meta-card"><span>{t.reference}</span><strong>{result.request.id}</strong></div><div className="legal-meta-card"><span>{t.status}</span><strong>{result.deleted ? t.completed : t.verification}</strong></div></div>
            <Link href="/" className="future-button mt-8 inline-flex rounded-full px-5 py-3 text-sm">{t.back}</Link>
          </section>
        ) : (
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {profile ? (
              <section className="delete-panel">
                <p className="data-label">SIGNED-IN REQUEST</p>
                <h2 className="mt-4 text-2xl font-medium tracking-[-.04em]">{t.signedTitle}</h2>
                <p className="mt-3 text-sm leading-6 text-white/42">{t.signedBody} <strong className="text-white/75">{profile.email}</strong>.</p>
                <p className="mt-6 rounded-xl border border-red-200/[.08] bg-red-300/[.035] px-4 py-3 text-xs leading-5 text-red-50/55">{t.irreversible}</p>
                <label className="settings-field mt-6"><span>{t.typeWord}</span><input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" /></label>
                <label className="mt-4 flex cursor-pointer items-start gap-3 text-xs leading-5 text-white/45"><input className="sr-only" type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span className={`checkbox-visual ${confirmed ? "checkbox-visual-active" : ""}`}>{confirmed && <Check className="h-3 w-3" />}</span><span>{t.finalCheck}</span></label>
                {error && <p role="alert" className="mt-4 rounded-xl border border-red-300/10 bg-red-400/[.06] px-4 py-3 text-sm text-red-100/75">{error}</p>}
                <button type="button" onClick={deleteSignedInData} className="danger-button mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm"><Trash2 className="h-4 w-4" />{t.deleteButton}</button>
                <Link href="/dashboard" className="mt-3 block text-center text-xs text-white/30 transition hover:text-white">{t.cancel}</Link>
              </section>
            ) : (
              <section className="delete-panel lg:col-span-2 lg:max-w-3xl">
                <p className="data-label">EXTERNAL PRIVACY REQUEST</p>
                <h2 className="mt-4 text-2xl font-medium tracking-[-.04em]">{t.externalTitle}</h2>
                <p className="mt-3 text-sm leading-6 text-white/42">{t.externalBody}</p>
                <form onSubmit={submitExternal} className="mt-7 grid gap-5 sm:grid-cols-2" noValidate>
                  <label className="settings-field"><span>{t.name}</span><input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" /></label>
                  <label className="settings-field"><span>{t.email}</span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required /></label>
                  <label className="settings-field sm:col-span-2"><span>{t.requestType}</span><select value={requestType} onChange={(event) => setRequestType(event.target.value as DeletionRequest["requestType"])}><option value="account_and_all_data">{t.all}</option><option value="imported_conversations">{t.conversations}</option><option value="ai_memory">{t.memory}</option><option value="other">{t.other}</option></select></label>
                  <label className="settings-field sm:col-span-2"><span>{t.explanation}</span><textarea rows={5} value={explanation} onChange={(event) => setExplanation(event.target.value)} /></label>
                  <label className="sm:col-span-2 flex cursor-pointer items-start gap-3 text-xs leading-5 text-white/45"><input className="sr-only" type="checkbox" checked={contactConsent} onChange={(event) => setContactConsent(event.target.checked)} /><span className={`checkbox-visual ${contactConsent ? "checkbox-visual-active" : ""}`}>{contactConsent && <Check className="h-3 w-3" />}</span><span>{t.contact}</span></label>
                  {error && <p role="alert" className="sm:col-span-2 rounded-xl border border-red-300/10 bg-red-400/[.06] px-4 py-3 text-sm text-red-100/75">{error}</p>}
                  <button className="future-button sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm"><FileDown className="h-4 w-4" />{t.prepare}</button>
                </form>
              </section>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
