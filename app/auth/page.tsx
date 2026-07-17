"use client";

import { ArrowLeft, Check, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AltrShardScene } from "@/components/AltrShardScene";
import { AltrLogo } from "@/components/Navigation";
import { getCurrentProfile, registerAccount, signInAccount, signInWithGoogle } from "@/lib/auth";
import { useLang } from "@/lib/i18n/lang-store";
import { LEGAL_VERSION } from "@/lib/legal";

type Mode = "register" | "login";

const copy = {
  EN: {
    back: "Back home",
    visualLabel: "Your context, assembled with permission",
    visualTitle: "A private intelligence that becomes more like you.",
    visualBody: "Start with one account. Add only the memories and connections you choose. Altr learns quietly, then acts within your boundaries.",
    registerTitle: "Create your Altr",
    loginTitle: "Welcome back",
    registerBody: "Create the account first. You will shape your Altr during a short onboarding.",
    loginBody: "Return to your private workspace.",
    google: "Continue with Google",
    email: "Email",
    password: "Password",
    forgot: "Forgot password?",
    register: "Create account",
    login: "Log in",
    wait: "Please wait…",
    registerPrompt: "Already have an account?",
    loginPrompt: "New to Altr?",
    registerLink: "Log in",
    loginLink: "Create one",
    legalSummary: "Privacy and processing permissions",
    terms: "I accept the Terms and Privacy Policy.",
    conversations: "I allow Altr to process conversations I explicitly import.",
    memory: "I allow Altr to create personalized memory from approved sources.",
    show: "Show password",
    hide: "Hide password",
    verification: "Check your email and confirm registration. After confirmation, you will return to Altr.",
    errors: {
      email: "Enter a valid email address.",
      password: "Password must contain at least 8 characters.",
      consent: "Confirm all three permissions to create your Altr.",
      fallback: "The action could not be completed. Please try again.",
    },
  },
  UA: {
    back: "На головну",
    visualLabel: "Твій контекст, зібраний лише з дозволу",
    visualTitle: "Приватний інтелект, який поступово стає схожим на тебе.",
    visualBody: "Почни з одного акаунта. Додавай лише ті спогади й звʼязки, які обираєш сам. Altr навчається тихо й діє у визначених тобою межах.",
    registerTitle: "Створи свій Altr",
    loginTitle: "З поверненням",
    registerBody: "Спочатку створи акаунт. Особистість Altr налаштуєш під час короткого онбордингу.",
    loginBody: "Повернись у свій приватний простір.",
    google: "Продовжити з Google",
    email: "Email",
    password: "Пароль",
    forgot: "Забув пароль?",
    register: "Створити акаунт",
    login: "Увійти",
    wait: "Зачекай…",
    registerPrompt: "Уже маєш акаунт?",
    loginPrompt: "Ще не маєш Altr?",
    registerLink: "Увійти",
    loginLink: "Створити",
    legalSummary: "Приватність і дозволи на обробку",
    terms: "Я приймаю Умови та Політику конфіденційності.",
    conversations: "Я дозволяю обробляти лише ті переписки, які сам імпортую.",
    memory: "Я дозволяю створювати персональну памʼять із підтверджених джерел.",
    show: "Показати пароль",
    hide: "Сховати пароль",
    verification: "Перевір email і підтвердь реєстрацію. Після підтвердження ти повернешся в Altr.",
    errors: {
      email: "Вкажи коректну email-адресу.",
      password: "Пароль має містити щонайменше 8 символів.",
      consent: "Підтвердь усі три дозволи для створення Altr.",
      fallback: "Не вдалося виконати дію. Спробуй ще раз.",
    },
  },
} as const;

function ConsentControl({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-white/55">
      <input className="sr-only" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className={`checkbox-visual ${checked ? "checkbox-visual-active" : ""}`}>{checked && <Check className="h-3 w-3" />}</span>
      <span>{children}</span>
    </label>
  );
}

function nameFromEmail(email: string) {
  const raw = email.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Altr user";
  const normalized = raw.replace(/\b\w/g, (letter) => letter.toUpperCase());
  return normalized.length >= 2 ? normalized.slice(0, 120) : "Altr user";
}

export default function AuthPage() {
  const router = useRouter();
  const [lang] = useLang("EN");
  const t = copy[lang];
  const [mode, setMode] = useState<Mode>("register");
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
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError(t.errors.email);
    if (password.length < 8) return setError(t.errors.password);
    if (mode === "register" && (!acceptedTerms || !acceptedConversations || !acceptedMemory)) return setError(t.errors.consent);

    setLoading(true);
    try {
      if (mode === "register") {
        const result = await registerAccount({
          name: nameFromEmail(email),
          email,
          password,
          policyVersion: LEGAL_VERSION,
          termsAccepted: true,
          conversationProcessingAccepted: true,
          aiMemoryAccepted: true,
          locale: lang === "UA" ? "uk-UA" : "en-US",
        });
        if (result.requiresEmailVerification) {
          setNotice(t.verification);
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
    <main className="auth-page">
      <section className="auth-visual">
        <Link href="/" aria-label="Altr home"><AltrLogo /></Link>
        <AltrShardScene variant="compact" />
        <div className="auth-visual-copy">
          <p className="section-index">{t.visualLabel}</p>
          <h1>{t.visualTitle}</h1>
          <p>{t.visualBody}</p>
        </div>
      </section>

      <section className="auth-panel-wrap">
        <div className="auth-surface">
          <div className="auth-topline">
            <AltrLogo />
            <Link href="/" className="auth-back"><ArrowLeft className="h-4 w-4" />{t.back}</Link>
          </div>

          <p className="section-index">{mode === "register" ? "New account" : "Private access"}</p>
          <h2>{mode === "register" ? t.registerTitle : t.loginTitle}</h2>
          <p className="auth-subtitle">{mode === "register" ? t.registerBody : t.loginBody}</p>

          <button type="button" onClick={() => void signInWithGoogle()} className="glass-button auth-google">{t.google}</button>
          <div className="auth-divider">or email</div>

          <form onSubmit={submit} className="grid gap-4" noValidate>
            <label className="auth-field">
              <span>{t.email}</span>
              <span className="auth-input-wrap"><Mail className="h-4 w-4" /><input value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" type="email" /></span>
            </label>
            <label className="auth-field">
              <span>{t.password}</span>
              <span className="auth-input-wrap">
                <LockKeyhole className="h-4 w-4" />
                <input value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"} type={showPassword ? "text" : "password"} />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? t.hide : t.show}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </span>
            </label>

            {mode === "login" && <Link href="/auth/forgot-password" className="text-right text-xs text-white/55 underline underline-offset-4">{t.forgot}</Link>}

            {mode === "register" && (
              <details className="auth-consents">
                <summary>{t.legalSummary}</summary>
                <div>
                  <ConsentControl checked={acceptedTerms} onChange={setAcceptedTerms}>{t.terms} <Link href="/terms" target="_blank" className="underline">Terms</Link> · <Link href="/privacy" target="_blank" className="underline">Privacy</Link></ConsentControl>
                  <ConsentControl checked={acceptedConversations} onChange={setAcceptedConversations}>{t.conversations}</ConsentControl>
                  <ConsentControl checked={acceptedMemory} onChange={setAcceptedMemory}>{t.memory}</ConsentControl>
                </div>
              </details>
            )}

            {error && <p role="alert" className="border border-red-200/20 bg-red-300/10 p-3 text-sm text-red-100">{error}</p>}
            {notice && <p role="status" className="border border-white/10 bg-white/5 p-3 text-sm text-white/70">{notice}</p>}

            <button disabled={loading} className="future-button mt-1 w-full disabled:opacity-50">{loading ? t.wait : mode === "register" ? t.register : t.login}</button>
          </form>

          <p className="auth-switch">
            {mode === "register" ? t.registerPrompt : t.loginPrompt}{" "}
            <button type="button" onClick={() => switchMode(mode === "register" ? "login" : "register")}>{mode === "register" ? t.registerLink : t.loginLink}</button>
          </p>
        </div>
      </section>
    </main>
  );
}
