"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check, CreditCard, LockKeyhole, ReceiptText, ShieldCheck, Sparkles, UsersRound, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AiMark } from "@/components/Navigation";
import { billingPlans } from "@/lib/plans";
import type { PlanId } from "@/lib/auth";

const icons: Record<PlanId, typeof Sparkles> = { free: Sparkles, personal: Zap, work: UsersRound };

type BillingMe = { effectivePlan: PlanId; invoices: Array<{ id: string; status: string; receiptUrl: string | null }> };
type LivePrice = { planId: "personal" | "work"; amount: number; currency: string; interval: string; live: boolean };

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingMe | null>(null);
  const [prices, setPrices] = useState<LivePrice[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState("");
  const [feature, setFeature] = useState("");

  useEffect(() => {
    setFeature(new URLSearchParams(window.location.search).get("feature") ?? "");
    fetch("/api/billing/me", { cache: "no-store" }).then(async (response) => { if (response.ok) setBilling(await response.json()); }).catch(() => undefined);
    fetch("/api/billing/plans", { cache: "no-store" }).then(async (response) => { if (response.ok) { const payload = await response.json(); setPrices(payload.plans ?? []); setNotice(payload.notice ?? null); } }).catch(() => undefined);
  }, []);

  const startCheckout = async (planId: PlanId) => {
    if (planId === "free") { window.location.assign(billing ? "/dashboard" : "/auth?mode=register"); return; }
    setLoadingPlan(planId); setError("");
    const response = await fetch("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId }) });
    if (response.status === 401) { window.location.assign("/auth?next=/pricing"); return; }
    const payload = await response.json();
    if (!response.ok || typeof payload.checkoutUrl !== "string") { setError(payload.error || "CHECKOUT_FAILED"); setLoadingPlan(null); return; }
    window.location.assign(payload.checkoutUrl);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05080c] text-white">
      <div className="account-grid pointer-events-none fixed inset-0" />
      <header className="relative z-20 mx-auto flex h-24 max-w-7xl items-center justify-between px-5"><Link href="/" className="flex items-center gap-2 text-[15px] font-semibold">Altr <AiMark /></Link><Link href={billing ? "/dashboard" : "/"} className="inline-flex items-center gap-2 text-xs uppercase tracking-[.16em] text-white/42"><ArrowLeft className="h-4 w-4" />Back</Link></header>
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-8 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}><p className="eyebrow">LEMON SQUEEZY / HOSTED CHECKOUT</p><h1 className="mx-auto mt-5 max-w-4xl text-balance text-5xl font-medium leading-[.98] tracking-[-.065em] md:text-7xl">Choose your Altr plan.</h1><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/42">The browser sends only the application plan ID. The server selects the allowlisted Lemon Squeezy variant and checkout confirms the final amount.</p></motion.div>
        {feature && <div className="mx-auto mt-8 flex w-fit items-center gap-2 rounded-full border border-cyan-100/[.1] bg-cyan-200/[.04] px-4 py-2 text-sm text-cyan-50/60"><LockKeyhole className="h-4 w-4" />A higher plan is required for {feature}</div>}
        {notice && <p className="mx-auto mt-6 max-w-2xl text-sm text-amber-100/60">{notice}</p>}
        {error && <p className="mx-auto mt-6 max-w-2xl rounded-2xl border border-red-200/15 bg-red-500/10 p-4 text-sm text-red-100/80">{error}</p>}
        <div className="mt-12 grid gap-4 text-left lg:grid-cols-3">
          {billingPlans.map((plan, index) => {
            const current = billing?.effectivePlan === plan.id;
            const Icon = icons[plan.id];
            const live = prices.find((item) => item.planId === plan.id);
            const amount = plan.id === "free" ? 0 : (live?.amount ?? plan.price * 100) / 100;
            const currency = live?.currency ?? plan.currency;
            return <motion.article key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .08 }} className={`pricing-card relative flex min-h-[540px] flex-col rounded-[2rem] p-7 md:p-8 ${plan.popular ? "pricing-card-featured" : ""}`}>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-100/[.1] bg-cyan-200/[.04]"><Icon className="h-5 w-5 text-cyan-100/60" /></div>
              <p className="data-label mt-7">{plan.label}</p><h2 className="mt-3 text-3xl font-medium tracking-[-.045em]">{plan.name}</h2><p className="mt-4 min-h-[72px] text-sm leading-6 text-white/38">{plan.description}</p>
              <div className="mt-7 flex items-end gap-2"><span className="text-5xl font-medium tracking-[-.06em]">{amount ? `${currency} ${amount}` : "Free"}</span><span className="pb-1.5 text-sm text-white/30">{amount ? "/ month" : ""}</span></div>
              {plan.paid && <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-cyan-50/50"><span className="inline-flex items-center gap-1 rounded-full border border-cyan-100/10 px-2.5 py-1"><CreditCard className="h-3 w-3" />Hosted checkout</span><span className="inline-flex items-center gap-1 rounded-full border border-cyan-100/10 px-2.5 py-1"><ReceiptText className="h-3 w-3" />Provider receipts</span></div>}
              <div className="my-7 h-px bg-white/[.065]" /><ul className="space-y-3.5">{plan.features.map((item) => <li key={item} className="flex items-start gap-3 text-sm text-white/55"><Check className="mt-0.5 h-4 w-4 flex-none text-cyan-100/55" />{item}</li>)}</ul>
              <button onClick={() => void startCheckout(plan.id)} disabled={current || loadingPlan === plan.id} className={`${plan.popular ? "future-button" : "glass-button"} mt-auto flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm disabled:opacity-60`}>{loadingPlan === plan.id ? "Creating checkout…" : current ? "Current plan" : plan.paid ? "Continue to checkout" : "Start free"}</button>
            </motion.article>;
          })}
        </div>
        <div className="mt-6 grid gap-4 text-left md:grid-cols-2"><section className="pricing-card rounded-[2rem] p-7"><ShieldCheck className="h-5 w-5 text-cyan-100/60" /><h2 className="mt-4 text-2xl font-medium">Webhook-confirmed access only.</h2><p className="mt-3 text-sm leading-6 text-white/38">Opening the success URL or changing browser state never grants premium access.</p></section><section className="pricing-card rounded-[2rem] p-7"><p className="data-label">BILLING MANAGEMENT</p><h2 className="mt-4 text-2xl font-medium">Manage payment details and cancellation in the Lemon Squeezy Customer Portal.</h2><Link href="/billing" className="future-button mt-6 inline-flex rounded-full px-5 py-3 text-sm">Open billing</Link></section></div>
      </section>
    </main>
  );
}
