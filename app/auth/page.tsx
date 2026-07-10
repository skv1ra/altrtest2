"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AiMark } from "@/components/Navigation";
import { getCurrentProfile, registerAccount, signInAccount } from "@/lib/auth";
import { useLang } from "@/lib/i18n/lang-store";

type Mode = "register" | "login";

const consentCopy = {
  EN: {
    terms: <>I agree to the <Link href="/terms" className="consent-link">Terms of Use</Link> and acknowledge the <Link href="/privacy" className="consent-link">Privacy Policy</Link>.</>,
    conversations: <>I consent to Altr processing the conversations I choose to import or connect in order to analyze my communication style, context, and response patterns.</>,
    memory: <>I consent to Altr creating and storing a personal AI memory derived from the data I provide, including communication patterns, preferences, context, routines, and inferred profile information.</>,
    conversationMore: "How conversation processing works", memoryMore: "How personal AI memory works", requiredError: "Accept the Terms of Use and acknowledge the Privacy Policy.",
    nameError: "Enter a name of at least 2 characters.", emailError: "Enter a valid email address.", passwordError: "Password must contain at least 6 characters.", accountExists: "An account with this email already exists. Try signing in.", invalid: "Email or password does not match. Check the details and try again.",
    register: "Register", login: "Sign in", newIdentity: "NEW IDENTITY", welcome: "WELCOME BACK", createTitle: "Create your Altr", returnTitle: "Return to your Altr", createBody: "Start with an account — your twin settings wait in the dashboard.", returnBody: "Sign in to continue building your digital self.", name: "Name", namePlaceholder: "How should Altr address you?", password: "Password", passwordPlaceholder: "Minimum 6 characters", createButton: "Create your second self", loginButton: "Sign in", wait: "Please wait…", have: "Already have an account?", noAccount: "No account yet?", goLogin: "Sign in", goRegister: "Register", home: "Home", optional: "The two AI consents are optional. Declining them does not block a basic account; imports and AI-memory creation remain disabled until you enable them later.", show: "Show password", hide: "Hide password",
  },
  UA: {
    terms: <>Я погоджуюся з <Link href="/terms" className="consent-link">Умовами використання</Link> та підтверджую, що ознайомився(-лася) з <Link href="/privacy" className="consent-link">Політикою конфіденційності</Link>.</>,
    conversations: <>Я надаю згоду Altr на обробку переписок, які я вирішу імпортувати або підключити, для аналізу мого стилю спілкування, контексту та моделей відповідей.</>,
    memory: <>Я надаю згоду Altr на створення та зберігання персональної AI-памʼяті на основі наданих мною даних, включно з моделями спілкування, уподобаннями, контекстом, звичками та похідною профільною інформацією.</>,
    conversationMore: "Як працює обробка переписок", memoryMore: "Як працює персональна AI-памʼять", requiredError: "Підтвердь Умови використання та Політику конфіденційності.",
    nameError: "Вкажи імʼя — щонайменше 2 символи.", emailError: "Вкажи коректну email-адресу.", passwordError: "Пароль має містити щонайменше 6 символів.", accountExists: "Акаунт із цією поштою вже існує. Спробуй увійти.", invalid: "Пошта або пароль не збігаються. Перевір дані й спробуй ще раз.",
    register: "Реєстрація", login: "Вхід", newIdentity: "NEW IDENTITY", welcome: "WELCOME BACK", createTitle: "Створи свій Altr", returnTitle: "Повернись до свого Altr", createBody: "Почни з акаунта — налаштування двійника чекають у кабінеті.", returnBody: "Увійди, щоб продовжити навчання цифрового двійника.", name: "Імʼя", namePlaceholder: "Як до тебе звертатися?", password: "Пароль", passwordPlaceholder: "Мінімум 6 символів", createButton: "Створити другого себе", loginButton: "Увійти в акаунт", wait: "Зачекай…", have: "Вже маєш акаунт?", noAccount: "Ще не маєш акаунта?", goLogin: "Увійти", goRegister: "Зареєструватися", home: "На головну", optional: "Дві AI-згоди необовʼязкові. Відмова не блокує базовий акаунт; імпорт і створення AI-памʼяті залишаться вимкненими, доки ти не активуєш їх пізніше.", show: "Показати пароль", hide: "Сховати пароль",
  },
} as const;

const activationSteps = [
  ["01", "Створи приватний профіль", "Твої дані та модель Altr належать лише тобі."],
  ["02", "Підключи свій контекст", "Обери джерела, з яких Altr може навчатися."],
  ["03", "Активуй другого себе", "Тон, памʼять і рішення зʼєднаються в одну систему."],
] as const;

export default function AuthPage() {
  const router = useRouter();
  const [lang, setLang] = useLang("EN");
  const t = consentCopy[lang];
  const [mode, setMode] = useState<Mode>("register");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false); const [conversationConsent, setConversationConsent] = useState(false); const [aiMemoryConsent, setAiMemoryConsent] = useState(false);
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);

  useEffect(() => {
    const requestedMode = new URLSearchParams(window.location.search).get("mode");
    if (requestedMode === "login") setMode("login");
    if (getCurrentProfile()) router.replace("/dashboard");
  }, [router]);

  const switchMode = (nextMode: Mode) => { setMode(nextMode); setError(""); window.history.replaceState(null, "", `/auth?mode=${nextMode}`); };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError("");
    if (mode === "register" && name.trim().length < 2) { setError(t.nameError); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError(t.emailError); return; }
    if (password.length < 6) { setError(t.passwordError); return; }
    if (mode === "register" && !accepted) { setError(t.requiredError); return; }
    setLoading(true);
    try {
      if (mode === "register") await registerAccount({ name, email, password, consents: { terms: true, conversations: conversationConsent, aiMemory: aiMemoryConsent, locale: lang } });
      else await signInAccount(email, password);
      router.push("/dashboard");
    } catch (submitError) {
      const code = submitError instanceof Error ? submitError.message : "";
      setError(code === "ACCOUNT_EXISTS" ? t.accountExists : code === "TERMS_REQUIRED" ? t.requiredError : t.invalid);
    } finally { setLoading(false); }
  };

  return (
    <main className="account-page relative min-h-screen overflow-hidden bg-[#05080c] text-white selection:bg-cyan-200 selection:text-black">
      <div className="account-grid pointer-events-none fixed inset-0" /><div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(47,160,255,.12),transparent_28%),radial-gradient(circle_at_82%_70%,rgba(103,232,249,.07),transparent_30%)]" />
      <header className="relative z-20 mx-auto flex h-24 max-w-7xl items-center justify-between px-5 md:px-8"><Link href="/" className="flex items-center gap-2 text-[15px] font-semibold text-white"><span>Altr</span><AiMark /></Link><div className="flex items-center gap-5"><div className="flex items-center gap-2 text-xs tracking-[.1em]"><button type="button" onClick={() => setLang("EN")} className={lang === "EN" ? "text-cyan-100" : "text-white/34"}>EN</button><span className="text-white/15">/</span><button type="button" onClick={() => setLang("UA")} className={lang === "UA" ? "text-cyan-100" : "text-white/34"}>UA</button></div><Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/42 transition hover:text-white"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">{t.home}</span></Link></div></header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl items-center gap-12 px-5 pb-14 md:px-8 lg:grid-cols-[1fr_.82fr] lg:pb-24">
        <motion.section initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="hidden max-w-2xl lg:block">
          <p className="eyebrow mb-6 flex items-center gap-3"><span>ALTR ID</span><AiMark /><span>PRIVATE ACCESS LAYER</span></p><h1 className="text-balance text-6xl font-medium leading-[.98] tracking-[-.065em] xl:text-7xl">Один акаунт.<br /><span className="text-cyan-100/65">Твій цифровий двійник.</span></h1><p className="mt-7 max-w-xl text-lg leading-8 text-white/48">Увійди у приватний простір, де Altr навчається твоєму тону, зберігає контекст і поступово стає другим тобою.</p>
          <div className="mt-12 grid gap-3">{activationSteps.map(([number, title, description], index) => <motion.div key={number} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .12 + index * .07, duration: .55 }} className="activation-step flex items-start gap-5 rounded-[1.35rem] p-5"><span className="data-label mt-1">{number}</span><div><h2 className="font-medium tracking-[-.02em]">{title}</h2><p className="mt-1 text-sm leading-6 text-white/38">{description}</p></div><Check className="ml-auto mt-1 h-4 w-4 text-cyan-100/50" /></motion.div>)}</div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 24, scale: .98, filter: "blur(12px)" }} animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }} transition={{ duration: 0.76, delay: .08, ease: [0.16, 1, 0.3, 1] }} className="auth-card mx-auto w-full max-w-[540px] rounded-[2rem] p-6 sm:p-8 md:p-10">
          <div className="mb-8 flex rounded-full border border-white/[.07] bg-black/20 p-1"><button type="button" onClick={() => switchMode("register")} className={`auth-tab ${mode === "register" ? "auth-tab-active" : ""}`}>{t.register}</button><button type="button" onClick={() => switchMode("login")} className={`auth-tab ${mode === "login" ? "auth-tab-active" : ""}`}>{t.login}</button></div>
          <AnimatePresence mode="wait"><motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .22 }}>
            <p className="eyebrow">{mode === "register" ? t.newIdentity : t.welcome}</p><h2 className="mt-4 text-3xl font-medium tracking-[-.045em] sm:text-4xl">{mode === "register" ? t.createTitle : t.returnTitle}</h2><p className="mt-3 text-sm leading-6 text-white/40">{mode === "register" ? t.createBody : t.returnBody}</p>
            <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
              {mode === "register" && <label className="auth-field"><span>{t.name}</span><span className="auth-input-wrap"><UserRound className="h-4 w-4" /><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder={t.namePlaceholder} /></span></label>}
              <label className="auth-field"><span>Email</span><span className="auth-input-wrap"><Mail className="h-4 w-4" /><input value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" type="email" placeholder="you@email.com" /></span></label>
              <label className="auth-field"><span>{t.password}</span><span className="auth-input-wrap"><LockKeyhole className="h-4 w-4" /><input value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"} type={showPassword ? "text" : "password"} placeholder={t.passwordPlaceholder} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? t.hide : t.show}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
              {mode === "register" && <div className="consent-stack mt-3 space-y-3"><ConsentRow checked={accepted} onChange={setAccepted} required>{t.terms}</ConsentRow><ConsentRow checked={conversationConsent} onChange={setConversationConsent}>{t.conversations}<Link href="/privacy#how-memory-is-built" className="consent-more">{t.conversationMore} →</Link></ConsentRow><ConsentRow checked={aiMemoryConsent} onChange={setAiMemoryConsent}>{t.memory}<Link href="/privacy#your-control-over-memory" className="consent-more">{t.memoryMore} →</Link></ConsentRow><p className="px-1 text-[11px] leading-5 text-white/28">{t.optional}</p></div>}
              <AnimatePresence>{error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="rounded-xl border border-red-300/10 bg-red-400/[.06] px-4 py-3 text-sm text-red-100/75">{error}</motion.p>}</AnimatePresence>
              <button disabled={loading} className="future-button group flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-medium text-white disabled:cursor-wait disabled:opacity-60"><span>{loading ? t.wait : mode === "register" ? t.createButton : t.loginButton}</span><span className="ml-3 h-1.5 w-1.5 rounded-full bg-cyan-100 shadow-[0_0_18px_rgba(125,211,252,.95)] transition group-hover:scale-150" /></button>
            </form>
            <p className="mt-6 text-center text-sm text-white/35">{mode === "register" ? t.have : t.noAccount}{" "}<button type="button" onClick={() => switchMode(mode === "register" ? "login" : "register")} className="text-cyan-100/70 transition hover:text-cyan-50">{mode === "register" ? t.goLogin : t.goRegister}</button></p>
          </motion.div></AnimatePresence>
        </motion.section>
      </div>
    </main>
  );
}

function ConsentRow({ checked, onChange, children, required = false }: { checked: boolean; onChange: (value: boolean) => void; children: React.ReactNode; required?: boolean }) {
  return <label className="consent-row flex cursor-pointer items-start gap-3 rounded-[1.1rem] border border-white/[.06] bg-black/15 p-3.5 text-xs leading-5 text-white/42"><input className="auth-checkbox sr-only" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span className={`checkbox-visual mt-0.5 ${checked ? "checkbox-visual-active" : ""}`}>{checked && <Check className="h-3 w-3" />}</span><span className="min-w-0 flex-1">{children}{required && <span className="ml-1 text-cyan-100/55">*</span>}</span></label>;
}
