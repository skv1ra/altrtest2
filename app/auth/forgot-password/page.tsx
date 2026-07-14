"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { requestPasswordReset } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Спробуй ще раз пізніше.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05080c] px-5 text-white">
      <section className="auth-card w-full max-w-md rounded-[2rem] p-8">
        <p className="eyebrow">ACCOUNT RECOVERY</p>
        <h1 className="mt-4 text-3xl font-medium tracking-[-.04em]">Відновлення пароля</h1>
        <p className="mt-3 text-sm leading-6 text-white/45">Введи email. Відповідь буде однаковою незалежно від того, чи існує акаунт.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="auth-field"><span>Email</span><span className="auth-input-wrap"><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" /></span></label>
          {message && <p role="status" className="rounded-xl border border-white/[.07] bg-white/[.03] px-4 py-3 text-sm text-white/65">{message}</p>}
          <button disabled={loading} className="future-button flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-medium disabled:opacity-60">{loading ? "Зачекай…" : "Надіслати інструкції"}</button>
        </form>
        <Link href="/auth?mode=login" className="mt-6 block text-center text-sm text-cyan-100/65">Повернутися до входу</Link>
      </section>
    </main>
  );
}
