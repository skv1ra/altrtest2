"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check, CreditCard, LockKeyhole, ReceiptText, RefreshCcw, ShieldCheck, Sparkles, UsersRound, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiMark } from "@/components/Navigation";
import { AltrProfile, getCurrentProfile, PlanId } from "@/lib/auth";
import { billingPlans } from "@/lib/plans";

const icons: Record<PlanId, typeof Sparkles> = { free: Sparkles, personal: Zap, work: UsersRound };

const featureNames: Record<string, string> = {
  calendar: "підключення календаря", messages: "підключення повідомлень", workspace: "командний простір",
  tone: "розширені стилі тону", drafts: "автоматичні чернетки", digest: "щотижневий підсумок",
  "import-telegram": "імпорт Telegram", "import-gmail": "імпорт Gmail / Google Takeout", "import-whatsapp": "імпорт WhatsApp",
  "import-instagram": "імпорт Instagram", "import-messenger": "імпорт Messenger", "import-limit": "додаткові імпорти",
};

export default function PricingPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<AltrProfile | null>(null);
  const [feature, setFeature] = useState("");
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    getCurrentProfile().then(setProfile);
    setFeature(new URLSearchParams(window.location.search).get("feature") ?? "");
  }, []);

  const startCheckout = async (plan: PlanId) => {
    setPayError("");
    if (!profile) return router.push("/auth?mode=register");
    if (plan === "free") return;

    setLoadingPlan(plan);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan }),
      });
      const result = await response.json();
      if (!response.ok || typeof result.checkoutUrl !== "string") throw new Error(result.error || "Не вдалося створити checkout");
      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setPayError(error instanceof Error ? error.message : "Помилка оплати");
      setLoadingPlan(null);
    }
  };

  const invoices = profile?.invoices ?? [];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05080c] text-white">
      <div className="account-grid pointer-events-none fixed inset-0" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_5%,rgba(47,160,255,.14),transparent_34%),radial-gradient(circle_at_90%_70%,rgba(103,232,249,.055),transparent_30%)]" />
      <header className="relative z-20 mx-auto flex h-24 max-w-7xl items-center justify-between px-5"><Link href="/" className="flex items-center gap-2 text-[15px] font-semibold">Altr <AiMark /></Link><Link href={profile ? "/dashboard" : "/"} className="inline-flex items-center gap-2 text-xs uppercase tracking-[.16em] text-white/42 transition hover:text-white"><ArrowLeft className="h-4 w-4" />{profile ? "До кабінету" : "На головну"}</Link></header>
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-8 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}><p className="eyebrow">LEMON SQUEEZY / SUBSCRIPTION</p><h1 className="mx-auto mt-5 max-w-4xl text-balance text-5xl font-medium leading-[.98] tracking-[-.065em] md:text-7xl">Обери рівень свого другого себе.</h1><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/42">Оплата карткою через Lemon Squeezy. Платний план відкривається тільки після перевіреного серверного webhook.</p></motion.div>
        {feature && <div className="mx-auto mt-8 flex w-fit items-center gap-2 rounded-full border border-cyan-100/[.1] bg-cyan-200/[.04] px-4 py-2 text-sm text-cyan-50/60"><LockKeyhole className="h-4 w-4" />Для функції «{featureNames[feature] ?? "преміальна можливість"}» потрібен вищий план</div>}
        {payError && <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-red-200/15 bg-red-500/10 px-5 py-4 text-sm text-red-100/80">{payError}</div>}
        <div className="mt-12 grid gap-4 text-left lg:grid-cols-3">
          {billingPlans.map((plan, index) => {
            const current = profile?.plan === plan.id;
            const Icon = icons[plan.id];
            return <motion.article key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .08 }} className={`pricing-card relative flex min-h-[560px] flex-col rounded-[2rem] p-7 md:p-8 ${plan.popular ? "pricing-card-featured" : ""}`}>
              {plan.popular && <span className="absolute right-6 top-6 rounded-full border border-cyan-100/15 bg-cyan-200/[.08] px-3 py-1.5 text-[10px] uppercase tracking-[.18em] text-cyan-50/70">Найпопулярніша</span>}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-100/[.1] bg-cyan-200/[.04]"><Icon className="h-5 w-5 text-cyan-100/60" /></div>
              <p className="data-label mt-7">{plan.label}</p><h2 className="mt-3 text-3xl font-medium tracking-[-.045em]">{plan.name}</h2><p className="mt-4 min-h-[72px] text-sm leading-6 text-white/38">{plan.description}</p>
              <div className="mt-7 flex items-end gap-2">{plan.originalPrice && <span className="pb-1.5 text-xl text-white/25 line-through decoration-white/30">${plan.originalPrice}</span>}<span className="text-5xl font-medium tracking-[-.06em]">${plan.price}</span><span className="pb-1.5 text-sm text-white/30">{plan.price ? "/ місяць" : "назавжди"}</span></div>
              {plan.paid && <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-cyan-50/50"><span className="inline-flex items-center gap-1 rounded-full border border-cyan-100/10 px-2.5 py-1"><CreditCard className="h-3 w-3" />Card</span><span className="inline-flex items-center gap-1 rounded-full border border-cyan-100/10 px-2.5 py-1"><RefreshCcw className="h-3 w-3" />Webhook renewal</span><span className="inline-flex items-center gap-1 rounded-full border border-cyan-100/10 px-2.5 py-1"><ReceiptText className="h-3 w-3" />Receipt</span></div>}
              <div className="my-7 h-px bg-white/[.065]" /><ul className="space-y-3.5">{plan.features.map(item => <li key={item} className="flex items-start gap-3 text-sm text-white/55"><Check className="mt-0.5 h-4 w-4 flex-none text-cyan-100/55" />{item}</li>)}</ul>
              <button onClick={() => plan.paid ? startCheckout(plan.id) : router.push(profile ? "/dashboard" : "/auth?mode=register")} disabled={current || loadingPlan === plan.id} className={`${plan.popular ? "future-button" : "glass-button"} mt-auto flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm disabled:cursor-default disabled:opacity-60`}>{loadingPlan === plan.id ? "Створюємо checkout..." : current ? "Поточний план" : plan.price ? `Оплатити $${plan.price}` : "Почати безкоштовно"}</button>
            </motion.article>;
          })}
        </div>
        <div className="mt-6 grid gap-4 text-left lg:grid-cols-[1.1fr_.9fr]"><section className="pricing-card rounded-[2rem] p-6 md:p-8"><div className="flex items-start gap-4"><ShieldCheck className="mt-1 h-5 w-5 text-cyan-100/60" /><div><p className="data-label">ACTIVE TARIFF CHECK</p><h2 className="mt-3 text-2xl font-medium">Платні функції відкриваються тільки з активною підпискою.</h2><p className="mt-3 text-sm leading-6 text-white/38">Успішна сторінка оплати не активує тариф. План оновлюється лише після верифікованого Lemon Squeezy webhook, привʼязаного до Supabase user UUID.</p></div></div></section><section className="pricing-card rounded-[2rem] p-6 md:p-8"><p className="data-label">INVOICES / RECEIPTS</p><h2 className="mt-3 text-2xl font-medium">Квитанції</h2>{invoices.length ? <div className="mt-5 space-y-3">{invoices.map(invoice => <a key={invoice.id} href={invoice.receiptUrl ?? "#"} className="flex items-center justify-between rounded-2xl border border-white/[.07] bg-white/[.025] px-4 py-3 text-sm text-white/45"><span>{invoice.orderId}</span><span>{invoice.status}</span></a>)}</div> : <p className="mt-4 text-sm leading-6 text-white/35">Квитанції зʼявляться тут після підтверджених webhook-платежів.</p>}</section></div>
      </section>
    </main>
  );
}
