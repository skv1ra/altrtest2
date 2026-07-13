"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AiMark } from "@/components/Navigation";
import { getCurrentProfile, registerAccount, signInAccount, signInWithGoogle } from "@/lib/auth";
import { LEGAL_VERSION } from "@/lib/legal";

type Mode = "register" | "login";

const activationSteps = [
  ["01", "Створи приватний профіль", "Акаунт і сесія зберігаються через Supabase Auth, не localStorage."],
  ["02", "Підключи свій контекст", "Altr використовує тільки ті дані, які ти явно імпортуєш."],
  ["03", "Отримуй draft replies", "AI створює чернетки, а не відправляє повідомлення автоматично."],
] as const;

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedConversations, setAcceptedConversations] = useState(false);
  const [acceptedMemory, setAcceptedMemory] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const requestedMode = new URLSearchParams(window.location.search).get("mode");
    if (requestedMode === "login") setMode("login");
    getCurrentProfile().then((profile) => { if (profile) router.replace("/dashboard"); });
  }, [router]);

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError("");
    window.history.replaceState(null, "", `/auth?mode=${nextMode}`);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (mode === "register" && name.trim().length < 2) return setError("Вкажи імʼя — щонайменше 2 символи.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Вкажи коректну email-адресу.");
    if (password.length < 8) return setError("Пароль має містити щонайменше 8 символів.");
    if (mode === "register" && (!acceptedTerms || !acceptedConversations || !acceptedMemory)) return setError("Для створення Altr підтвердь усі три окремі згоди.");

    setLoading(true);
    try {
      if (mode === "register") await registerAccount({ name, email, password, policyVersion: LEGAL_VERSION });
      else await signInAccount(email, password);
      router.push("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не вдалося увійти. Перевір дані й спробуй ще раз.");
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
        <Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/42 transition hover:text-white"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">На головну</span></Link>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl items-center gap-12 px-5 pb-14 md:px-8 lg:grid-cols-[1fr_.82fr] lg:pb-24">
        <motion.section initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="hidden max-w-2xl lg:block">
          <p className="eyebrow mb-6 flex items-center gap-3"><span>ALTR ID</span><AiMark /><span>PRIVATE ACCESS LAYER</span></p>
          <h1 className="text-balance text-6xl font-medium leading-[.98] tracking-[-.065em] xl:text-7xl">Один акаунт.<br /><span className="text-cyan-100/65">Твій цифровий двійник.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/48">Увійди у приватний простір, де Altr навчається твоєму тону, зберігає контекст і готує чернетки відповідей.</p>
          <div className="mt-12 grid gap-3">{activationSteps.map(([number, title, description], index) => <motion.div key={number} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .12 + index * .07, duration: .55 }} className="activation-step flex items-start gap-5 rounded-[1.35rem] p-5"><span className="data-label mt-1">{number}</span><div><h2 className="font-medium tracking-[-.02em]">{title}</h2><p className="mt-1 text-sm leading-6 text-white/38">{description}</p></div><Check className="ml-auto mt-1 h-4 w-4 text-cyan-100/50" /></motion.div>)}</div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 24, scale: .98, filter: "blur(12px)" }} animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }} transition={{ duration: 0.76, delay: .08, ease: [0.16, 1, 0.3, 1] }} className="auth-card mx-auto w-full max-w-[520px] rounded-[2rem] p-6 sm:p-8 md:p-10">
          <div className="mb-8 flex rounded-full border border-white/[.07] bg-black/20 p-1"><button onClick={() => switchMode("register")} className={`auth-tab ${mode === "register" ? "auth-tab-active" : ""}`}>Реєстрація</button><button onClick={() => switchMode("login")} className={`auth-tab ${mode === "login" ? "auth-tab-active" : ""}`}>Вхід</button></div>
          <p className="eyebrow">{mode === "register" ? "NEW IDENTITY" : "WELCOME BACK"}</p>
          <h2 className="mt-4 text-3xl font-medium tracking-[-.045em] sm:text-4xl">{mode === "register" ? "Створи свій Altr" : "Повернись до свого Altr"}</h2>
          <button type="button" onClick={() => signInWithGoogle()} className="glass-button mt-7 flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-medium text-white/80">Continue with Google</button>
          <div className="my-7 flex items-center gap-3 text-xs uppercase tracking-[.18em] text-white/25"><span className="h-px flex-1 bg-white/[.08]" />або email<span className="h-px flex-1 bg-white/[.08]" /></div>
          <form onSubmit={submit} className="space-y-4" noValidate>
            {mode === "register" && <label className="auth-field"><span>Імʼя</span><span className="auth-input-wrap"><UserRound className="h-4 w-4" /><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Як до тебе звертатися?" /></span></label>}
            <label className="auth-field"><span>Email</span><span className="auth-input-wrap"><Mail className="h-4 w-4" /><input value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" type="email" placeholder="you@email.com" /></span></label>
            <label className="auth-field"><span>Пароль</span><span className="auth-input-wrap"><LockKeyhole className="h-4 w-4" /><input value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"} type={showPassword ? "text" : "password"} placeholder="Мінімум 8 символів" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Сховати пароль" : "Показати пароль"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
            {mode === "register" && <div className="space-y-3 rounded-[1rem] border border-white/[.06] bg-black/10 p-4">
              <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-white/42"><input className="sr-only" type="checkbox" checked={acceptedTerms} onChange={e=>setAcceptedTerms(e.target.checked)} /><span className={`checkbox-visual ${acceptedTerms ? "checkbox-visual-active" : ""}`}>{acceptedTerms && <Check className="h-3 w-3" />}</span><span>Я приймаю <Link className="text-cyan-100/65 underline underline-offset-2" href="/terms" target="_blank">Terms of Use</Link> та <Link className="text-cyan-100/65 underline underline-offset-2" href="/privacy" target="_blank">Privacy Policy</Link>.</span></label>
              <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-white/42"><input className="sr-only" type="checkbox" checked={acceptedConversations} onChange={e=>setAcceptedConversations(e.target.checked)} /><span className={`checkbox-visual ${acceptedConversations ? "checkbox-visual-active" : ""}`}>{acceptedConversations && <Check className="h-3 w-3" />}</span><span>Я даю явну згоду на обробку переписок, які самостійно імпортую або підключу.</span></label>
              <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-white/42"><input className="sr-only" type="checkbox" checked={acceptedMemory} onChange={e=>setAcceptedMemory(e.target.checked)} /><span className={`checkbox-visual ${acceptedMemory ? "checkbox-visual-active" : ""}`}>{acceptedMemory && <Check className="h-3 w-3" />}</span><span>Я даю згоду на створення прозорої персональної AI-памʼяті з можливістю редагування й видалення.</span></label>
            </div>}
            {error && <p role="alert" className="rounded-xl border border-red-300/10 bg-red-400/[.06] px-4 py-3 text-sm text-red-100/75">{error}</p>}
            <button disabled={loading} className="future-button group flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-medium text-white disabled:cursor-wait disabled:opacity-60"><span>{loading ? "Зачекай…" : mode === "register" ? "Створити другого себе" : "Увійти в акаунт"}</span><span className="ml-3 h-1.5 w-1.5 rounded-full bg-cyan-100 shadow-[0_0_18px_rgba(125,211,252,.95)] transition group-hover:scale-150" /></button>
          </form>
          <p className="mt-6 text-center text-sm text-white/35">{mode === "register" ? "Уже маєш акаунт? " : "Ще немає акаунта? "}<button onClick={() => switchMode(mode === "register" ? "login" : "register")} className="text-cyan-100/70 transition hover:text-cyan-50">{mode === "register" ? "Увійти" : "Зареєструватися"}</button></p>
        </motion.section>
      </div>
    </main>
  );
}
