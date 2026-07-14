"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/lib/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password.length < 8) return setError("Пароль має містити щонайменше 8 символів.");
    if (password !== confirmPassword) return setError("Паролі не збігаються.");
    setLoading(true);
    try {
      await resetPassword(password);
      router.replace("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не вдалося оновити пароль.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05080c] px-5 text-white">
      <section className="auth-card w-full max-w-md rounded-[2rem] p-8">
        <p className="eyebrow">SECURE RESET</p>
        <h1 className="mt-4 text-3xl font-medium tracking-[-.04em]">Новий пароль</h1>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="auth-field"><span>Новий пароль</span><span className="auth-input-wrap"><input required type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></span></label>
          <label className="auth-field"><span>Повтори пароль</span><span className="auth-input-wrap"><input required type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></span></label>
          {error && <p role="alert" className="rounded-xl border border-red-300/10 bg-red-400/[.06] px-4 py-3 text-sm text-red-100/75">{error}</p>}
          <button disabled={loading} className="future-button flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-medium disabled:opacity-60">{loading ? "Зачекай…" : "Зберегти пароль"}</button>
        </form>
      </section>
    </main>
  );
}
