"use client";

import { CheckCircle2, ArrowRight, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { AiMark } from "@/components/Navigation";
import { activatePaidSubscription, AltrProfile, getCurrentProfile } from "@/lib/auth";
import { clearPendingPayment, getPendingPayment } from "@/lib/billing";
import type { PlanId } from "@/lib/auth";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") ?? "";
  const planFromUrl = (searchParams.get("plan") ?? "personal") as PlanId;
  const [profile, setProfile] = useState<AltrProfile | null>(null);
  const [message, setMessage] = useState("Активуємо вашу підписку...");

  const payment = useMemo(() => getPendingPayment(orderId) ?? {
    orderId: orderId || `manual_${Date.now()}`,
    plan: planFromUrl,
    amount: planFromUrl === "work" ? 40 : 20,
    currency: "USD",
    autoRenew: true,
    createdAt: new Date().toISOString(),
  }, [orderId, planFromUrl]);

  useEffect(() => {
    let cancelled = false;

    async function activateFromServer() {
      const current = getCurrentProfile();
      if (!current) {
        setMessage("Оплату отримано. Увійдіть в акаунт, щоб активувати тариф.");
        return;
      }

      try {
        const params = new URLSearchParams({ orderId: payment.orderId, email: current.email });
        const response = await fetch(`/api/billing/status?${params.toString()}`, { cache: "no-store" });
        const status = await response.json();

        if (cancelled) return;

        if (status.configured === false) {
          const next = activatePaidSubscription({
            plan: payment.plan,
            orderId: payment.orderId,
            amount: payment.amount,
            currency: payment.currency,
            autoRenew: payment.autoRenew,
          });
          if (next) {
            setProfile(next);
            setMessage("Supabase ще не підключений, тому підписку активовано локально для MVP.");
            clearPendingPayment();
          }
          return;
        }

        if (status.active && status.subscription) {
          const subscription = status.subscription;
          const next = activatePaidSubscription({
            plan: subscription.plan ?? payment.plan,
            orderId: subscription.order_id ?? payment.orderId,
            amount: Number(status.payment?.amount ?? payment.amount),
            currency: status.payment?.currency ?? payment.currency,
            autoRenew: Boolean(subscription.auto_renew),
          });
          if (next) {
            setProfile(next);
            setMessage("Підписку підтверджено через Supabase. Квитанцію збережено у вашому акаунті.");
            clearPendingPayment();
          }
          return;
        }

        setMessage("Оплату отримано. Очікуємо callback від LiqPay, щоб підтвердити підписку в Supabase. Оновіть сторінку через кілька секунд.");
      } catch {
        const next = activatePaidSubscription({
          plan: payment.plan,
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          autoRenew: payment.autoRenew,
        });
        if (next && !cancelled) {
          setProfile(next);
          setMessage("Підписку активовано локально. Серверну перевірку можна повторити після налаштування Supabase.");
          clearPendingPayment();
        }
      }
    }

    activateFromServer();
    return () => { cancelled = true; };
  }, [payment]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05080c] px-5 py-16 text-white">
      <div className="account-grid pointer-events-none fixed inset-0" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(47,160,255,.16),transparent_34%)]" />
      <section className="pricing-card relative z-10 w-full max-w-2xl rounded-[2rem] p-8 text-center md:p-12">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2 text-[15px] font-semibold">Altr <AiMark /></Link>
        <CheckCircle2 className="mx-auto h-14 w-14 text-cyan-100/70" />
        <p className="eyebrow mt-7">PAYMENT RECEIVED</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-.055em] md:text-5xl">Оплата успішна.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/42">{message}</p>
        <div className="mt-8 rounded-2xl border border-cyan-100/[.08] bg-cyan-200/[.035] p-4 text-left text-sm text-white/48">
          <div className="flex justify-between gap-4"><span>Order ID</span><span className="text-right text-white/70">{payment.orderId}</span></div>
          <div className="mt-2 flex justify-between gap-4"><span>Plan</span><span className="text-white/70">{payment.plan.toUpperCase()}</span></div>
          <div className="mt-2 flex justify-between gap-4"><span>Auto-renew</span><span className="text-cyan-100/65">{payment.autoRenew ? "Enabled" : "Disabled"}</span></div>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/dashboard" className="future-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm">Go to Dashboard <ArrowRight className="h-4 w-4" /></Link>
          <Link href={`/payment/receipt/${payment.orderId}`} className="glass-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm"><ReceiptText className="h-4 w-4" />View Receipt</Link>
        </div>
        {profile?.subscription && <p className="mt-6 text-xs text-white/28">Активно до {new Date(profile.subscription.expiresAt).toLocaleDateString("uk-UA")}</p>}
      </section>
    </main>
  );
}


export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#05080c] text-white">Loading payment...</main>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
