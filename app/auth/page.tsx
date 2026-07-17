"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AiMark } from "@/components/Navigation";
import { getCurrentProfile, registerAccount, signInAccount, signInWithGoogle } from "@/lib/auth";
import { useLang } from "@/lib/i18n/lang-store";
import { LEGAL_VERSION } from "@/lib/legal";

type Mode = "register" | "login";

const copy = {
  EN: {
    home: "Back home",
    sideLabel: "PRIVATE ACCESS LAYER",
    sideTitle: "One account.",
    sideAccent: "Your digital twin.",
    steps: [
      ["01", "Create a private profile", "Your account and cookie session are secured by Supabase Auth."],
      ["02", "Connect your context", "Altr uses only the data you explicitly import."],
      ["03", "Receive draft replies", "AI creates drafts only after your action."],
    ],
    registerTab: "Register",
    loginTab: "Sign in",
    registerTitle: "Create your Altr",
    loginTitle: "Return to your Altr",
    google: "Continue with Google",
    orEmail: "or email",
    name: "Name",
    password: "Password",
    hidePassword: "Hide password",
    showPassword: "Show password",
    forgot: "Forgot password?",
    terms: "I accept the",
    and: "and",
    conversations: "I consent to processing the conversations I import myself.",
    memory: "I consent to creating personalized AI memory.",
    wait: "Please wait…",
    register: "Create your second self",
    login: "Sign in",
    errors: {
      name: "Enter a name with at least 2 characters.",
      email: "Enter a valid email address.",
      password: "Password must contain at least 8 characters.",
      consent: "Confirm all three separate consents to create Altr.",
      fallback: "The action could not be completed. Please try again.",
    },
    verify: "Check your email and confirm registration. After confirmation, you will automatically return to Altr.",
  },
  UA: {
    home: "На головну",
    sideLabel: "PRIVATE ACCESS LAYER",
    sideTitle: "Один акаунт.",
    sideAccent: "Твій цифровий двійник.",
    steps: [
      ["01", "Створи приватний профіль", "Акаунт і cookie-сесія працюють через Supabase Auth."],
      ["02", "Підключи свій контекст", "Altr використовує тільки явно імпортовані дані."],
      ["03", "Отримуй чернетки відповідей", "AI створює чернетки лише після твоєї дії."],
    ],
    registerTab: "Реєстрація",
    loginTab: "Вхід",
    registerTitle: "Створи свій Altr",
    loginTitle: "Повернись до свого Altr",
    google: "Продовжити з Google",
    orEmail: "або email",
    name: "Імʼя",
    password: "Пароль",
    hidePassword: "Сховати пароль",
    showPassword: "Показати пароль",
    forgot: "Забув пароль?",
    terms: "Я приймаю",
    and: "та",
    conversations: "Я даю згоду на обробку переписок, які сам імпортую.",
    memory: "Я даю згоду на створення персональної AI-памʼяті.",
    wait: "Зачекай…",
    register: "Створити другого себе",
    login: "Увійти в акаунт",
    errors: {
      name: "Вкажи імʼя — щонайменше 2 символи.",
      email: "Вкажи коректну email-адресу.",
      password: "Пароль має містити щонайменше 8 символів.",
      consent: "Для створення Altr підтвердь усі три окремі згоди.",
      fallback: "Не вдалося виконати дію. Спробуй ще раз.",
    },
    verify: "Перевір email і підтвердь реєстрацію. Після підтвердження тебе автоматично поверне в Altr.",
  },
} as const;

function ConsentControl({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-white/42">
      <input className="sr-only" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className={`checkbox-visual ${checked ? "checkbox-visual-active" : ""}`}>{checked && <Check className="h-3 w-3" />}</span>
      <span>{children}</span>
    </label>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [lang] = useLang("EN");
  const t = copy[lang];
  const [mode, setMode] = useState<Mode>("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedConversations, setAcceptedConversations] = useState(false);
  const [acceptedMemory, setAcceptedMemory] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const requestedMode = new URLSearchParams(window.location.search).get("mode");
    if (requestedMode === "login") setMode("login");
    getCurrentProfile().then((profile) => { if (profile) router.replace("/dashboard"); });
  }, [router]);

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError("");
    setNotice("");
    window.history.replaceState(null, "", `/auth?mode=${nextMode}`);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (mode === "register" && name.trim().length < 2) return setError(t.errors.name);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError(t.errors.email);
    if (password.length < 8) return setError(t.errors.password);
    if (mode === "register" && (!acceptedTerms || !acceptedConversations || !acceptedMemory)) return setError(t.errors.consent);

    setLoading(true);
    try {
      if (mode === "register") {
        const result = await registerAccount({
          name,
          email,
          password,
          policyVersion: LEGAL_VERSION,
          termsAccepted: true,
          conversationProcessingAccepted: true,
          aiMemoryAccepted: true,
          locale: lang === "UA" ? "uk-UA" : "en-US",
        });
        if (result.requiresEmailVerification) {
          setNotice(t.verify);
          return;
        }
      } else {
        await signInAccount(email, password);
      }
      router.replace("/legacy-migration");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t.errors.fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="account-page relative min-h-screen overflow-hidden bg-[#05080c] text-white selection:bg-cyan-200 selection:text-black">
      <div className="account-grid pointer-events-none fixed inset-0" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(47,160,255,.12),transparent_28%),radial-gradient(circle_at_82%_70%,rgba(103,232,249,.07),transparent_30%)]" />
      <header className="relative z-20 mx-auto flex h-24 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold text-white"><span>Altr</span><AiMark /></Link>
        <Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/42 transition hover:text-white"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">{t.home}</span></Link>
      </header>
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl items-center gap-12 px-5 pb-14 md:px-8 lg:grid-cols-[1fr_.82fr] lg:pb-24">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hidden max-w-2xl lg:block">
          <h1 className="text-balance text-6xl font-medium leading-[.98] tracking-[-.065em] xl:text-7xl">{t.sideTitle}<br /><span className="text-cyan-100/65">{t.sideAccent}</span></h1>
          <div className="mt-12 grid gap-3">{t.steps.map(([number, title, description]) => <div key={number} className="activation-step flex items-start gap-5 rounded-[1.35rem] p-5"><span className="data-label mt-1">{number}</span><div><h2 className="font-medium">{title}</h2><p className="mt-1 text-sm leading-6 text-white/38">{description}</p></div><Check className="ml-auto mt-1 h-4 w-4 text-cyan-100/50" /></div>)}</div>
        </motion.section>
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="auth-card mx-auto w-full max-w-[520px] rounded-[2rem] p-6 sm:p-8 md:p-10">
          <div className="mb-8 flex rounded-full border border-white/[.07] bg-black/20 p-1"><button onClick={() => switchMode("register")} className={`auth-tab ${mode === "register" ? "auth-tab-active" : ""}`}>{t.registerTab}</button><button onClick={() => switchMode("login")} className={`auth-tab ${mode === "login" ? "auth-tab-active" : ""}`}>{t.loginTab}</button></div>
          <p className="eyebrow">{mode === "register" ? "NEW IDENTITY" : "WELCOME BACK"}</p>
          <h2 className="mt-4 text-3xl font-medium tracking-[-.045em] sm:text-4xl">{mode === "register" ? t.registerTitle : t.loginTitle}</h2>
          <button type="button" onClick={() => signInWithGoogle()} className="glass-button mt-7 flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-medium text-white/80">{t.google}</button>
          <div className="my-7 flex items-center gap-3 text-xs uppercase tracking-[.18em] text-white/25"><span className="h-px flex-1 bg-white/[.08]" />{t.orEmail}<span className="h-px flex-1 bg-white/[.08]" /></div>
          <form onSubmit={submit} className="space-y-4" noValidate>
            {mode === "register" && <label className="auth-field"><span>{t.name}</span><span className="auth-input-wrap"><UserRound className="h-4 w-4" /><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></span></label>}
            <label className="auth-field"><span>Email</span><span className="auth-input-wrap"><Mail className="h-4 w-4" /><input value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" type="email" /></span></label>
            <label className="auth-field"><span>{t.password}</span><span className="auth-input-wrap"><LockKeyhole className="h-4 w-4" /><input value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"} type={showPassword ? "text" : "password"} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? t.hidePassword : t.showPassword}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
            {mode === "login" && <Link href="/auth/forgot-password" className="block text-right text-xs text-cyan-100/60">{t.forgot}</Link>}
            {mode === "register" && <div className="space-y-3 rounded-[1rem] border border-white/[.06] bg-black/10 p-4">
              <ConsentControl checked={acceptedTerms} onChange={setAcceptedTerms}>{t.terms} <Link className="text-cyan-100/65 underline" href="/terms" target="_blank">Terms</Link> {t.and} <Link className="text-cyan-100/65 underline" href="/privacy" target="_blank">Privacy Policy</Link>.</ConsentControl>
              <ConsentControl checked={acceptedConversations} onChange={setAcceptedConversations}>{t.conversations}</ConsentControl>
              <ConsentControl checked={acceptedMemory} onChange={setAcceptedMemory}>{t.memory}</ConsentControl>
            </div>}
            {error && <p role="alert" className="rounded-xl border border-red-300/10 bg-red-400/[.06] px-4 py-3 text-sm text-red-100/75">{error}</p>}
            {notice && <p role="status" className="rounded-xl border border-cyan-200/10 bg-cyan-200/[.05] px-4 py-3 text-sm text-cyan-50/75">{notice}</p>}
            <button disabled={loading} className="future-button flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-medium disabled:opacity-60">{loading ? t.wait : mode === "register" ? t.register : t.login}</button>
          </form>
        </motion.section>
      </div>
    </main>
  );
}
