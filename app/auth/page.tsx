"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AiMark } from "@/components/Navigation";
import { getCurrentProfile, registerAccount, signInAccount } from "@/lib/auth";

type Mode = "register" | "login";

const activationSteps = [
  ["01", "Створи приватний профіль", "Твої дані та модель Altr належать лише тобі."],
  ["02", "Підключи свій контекст", "Обери джерела, з яких Altr може навчатися."],
  ["03", "Активуй другого себе", "Тон, памʼять і рішення зʼєднаються в одну систему."],
] as const;

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const requestedMode = new URLSearchParams(window.location.search).get("mode");
    if (requestedMode === "login") setMode("login");
    if (getCurrentProfile()) router.replace("/dashboard");
  }, [router]);

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError("");
    window.history.replaceState(null, "", `/auth?mode=${nextMode}`);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (mode === "register" && name.trim().length < 2) {
      setError("Вкажи імʼя — щонайменше 2 символи.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Вкажи коректну email-адресу.");
      return;
    }
    if (password.length < 6) {
      setError("Пароль має містити щонайменше 6 символів.");
      return;
    }
    if (mode === "register" && !accepted) {
      setError("Підтвердь умови використання та політику приватності.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        await registerAccount({ name, email, password });
      } else {
        await signInAccount(email, password);
      }
      router.push("/dashboard");
    } catch (submitError) {
      const code = submitError instanceof Error ? submitError.message : "";
      setError(
        code === "ACCOUNT_EXISTS"
          ? "Акаунт із цією поштою вже існує. Спробуй увійти."
          : "Пошта або пароль не збігаються. Перевір дані й спробуй ще раз.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="account-page relative min-h-screen overflow-hidden bg-[#05080c] text-white selection:bg-cyan-200 selection:text-black">
      <div className="account-grid pointer-events-none fixed inset-0" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(47,160,255,.12),transparent_28%),radial-gradient(circle_at_82%_70%,rgba(103,232,249,.07),transparent_30%)]" />

      <header className="relative z-20 mx-auto flex h-24 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold text-white">
          <span>Altr</span><AiMark />
        </Link>
        <Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/42 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">На головну</span>
        </Link>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl items-center gap-12 px-5 pb-14 md:px-8 lg:grid-cols-[1fr_.82fr] lg:pb-24">
        <motion.section
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="hidden max-w-2xl lg:block"
        >
          <p className="eyebrow mb-6 flex items-center gap-3"><span>ALTR ID</span><AiMark /><span>PRIVATE ACCESS LAYER</span></p>
          <h1 className="text-balance text-6xl font-medium leading-[.98] tracking-[-.065em] xl:text-7xl">
            Один акаунт.<br /><span className="text-cyan-100/65">Твій цифровий двійник.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/48">
            Увійди у приватний простір, де Altr навчається твоєму тону, зберігає контекст і поступово стає другим тобою.
          </p>

          <div className="mt-12 grid gap-3">
            {activationSteps.map(([number, title, description], index) => (
              <motion.div
                key={number}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: .12 + index * .07, duration: .55 }}
                className="activation-step flex items-start gap-5 rounded-[1.35rem] p-5"
              >
                <span className="data-label mt-1">{number}</span>
                <div><h2 className="font-medium tracking-[-.02em]">{title}</h2><p className="mt-1 text-sm leading-6 text-white/38">{description}</p></div>
                <Check className="ml-auto mt-1 h-4 w-4 text-cyan-100/50" />
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24, scale: .98, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.76, delay: .08, ease: [0.16, 1, 0.3, 1] }}
          className="auth-card mx-auto w-full max-w-[520px] rounded-[2rem] p-6 sm:p-8 md:p-10"
        >
          <div className="mb-8 flex rounded-full border border-white/[.07] bg-black/20 p-1">
            <button onClick={() => switchMode("register")} className={`auth-tab ${mode === "register" ? "auth-tab-active" : ""}`}>Реєстрація</button>
            <button onClick={() => switchMode("login")} className={`auth-tab ${mode === "login" ? "auth-tab-active" : ""}`}>Вхід</button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .22 }}>
              <p className="eyebrow">{mode === "register" ? "NEW IDENTITY" : "WELCOME BACK"}</p>
              <h2 className="mt-4 text-3xl font-medium tracking-[-.045em] sm:text-4xl">
                {mode === "register" ? "Створи свій Altr" : "Повернись до свого Altr"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/40">
                {mode === "register" ? "Почни з акаунта — налаштування двійника чекають у кабінеті." : "Увійди, щоб продовжити навчання цифрового двійника."}
              </p>

              <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
                {mode === "register" && (
                  <label className="auth-field">
                    <span>Імʼя</span>
                    <span className="auth-input-wrap"><UserRound className="h-4 w-4" /><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Як до тебе звертатися?" /></span>
                  </label>
                )}
                <label className="auth-field">
                  <span>Email</span>
                  <span className="auth-input-wrap"><Mail className="h-4 w-4" /><input value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" type="email" placeholder="you@email.com" /></span>
                </label>
                <label className="auth-field">
                  <span>Пароль</span>
                  <span className="auth-input-wrap"><LockKeyhole className="h-4 w-4" /><input value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"} type={showPassword ? "text" : "password"} placeholder="Мінімум 6 символів" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Сховати пароль" : "Показати пароль"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span>
                </label>

                {mode === "register" && (
                  <label className="mt-2 flex cursor-pointer items-start gap-3 text-xs leading-5 text-white/38">
                    <input className="auth-checkbox sr-only" type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
                    <span className={`checkbox-visual ${accepted ? "checkbox-visual-active" : ""}`}>{accepted && <Check className="h-3 w-3" />}</span>
                    <span>Я погоджуюсь з умовами використання та політикою приватності Altr.</span>
                  </label>
                )}

                <AnimatePresence>
                  {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="rounded-xl border border-red-300/10 bg-red-400/[.06] px-4 py-3 text-sm text-red-100/75">{error}</motion.p>}
                </AnimatePresence>

                <button disabled={loading} className="future-button group flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-medium text-white disabled:cursor-wait disabled:opacity-60">
                  <span>{loading ? "Зачекай…" : mode === "register" ? "Створити другого себе" : "Увійти в акаунт"}</span>
                  <span className="ml-3 h-1.5 w-1.5 rounded-full bg-cyan-100 shadow-[0_0_18px_rgba(125,211,252,.95)] transition group-hover:scale-150" />
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-white/35">
                {mode === "register" ? "Вже маєш акаунт?" : "Ще не маєш акаунта?"}{" "}
                <button onClick={() => switchMode(mode === "register" ? "login" : "register")} className="text-cyan-100/70 transition hover:text-cyan-50">
                  {mode === "register" ? "Увійти" : "Зареєструватися"}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.section>
      </div>
    </main>
  );
}
