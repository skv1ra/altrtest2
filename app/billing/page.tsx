"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, RefreshCcw } from "lucide-react";
import { AiMark } from "@/components/Navigation";

type BillingState = {
  effectivePlan: string;
  hasPremium: boolean;
  subscription: null | {
    planId: string | null;
    status: string;
    renewsAt: string | null;
    endsAt: string | null;
    trialEndsAt: string | null;
    testMode: boolean;
    canManage: boolean;
  };
  invoices: Array<{ id: string; status: string; amount: number; currency: string; receiptUrl: string | null; createdAt: string }>;
};

function date(value: string | null) {
  return value ? new Intl.DateTimeFormat("uk-UA", { dateStyle: "medium" }).format(new Date(value)) : "—";
}

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingState | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const response = await fetch("/api/billing/me", { cache: "no-store" });
    if (response.status === 401) { window.location.assign("/auth?next=/billing"); return; }
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "BILLING_LOAD_FAILED");
    setBilling(payload);
    setLoading(false);
  };

  useEffect(() => { void load().catch((value) => { setError(value instanceof Error ? value.message : "BILLING_LOAD_FAILED"); setLoading(false); }); }, []);

  const openPortal = async () => {
    const response = await fetch("/api/billing/portal", { method: "POST" });
    const payload = await response.json();
    if (!response.ok || typeof payload.portalUrl !== "string") { setError(payload.error || "PORTAL_FAILED"); return; }
    window.location.assign(payload.portalUrl);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05080c] px-5 pb-20 text-white">
      <div className="account-grid pointer-events-none fixed inset-0" />
      <header className="relative z-10 mx-auto flex h-24 max-w-5xl items-center justify-between"><Link href="/" className="flex items-center gap-2 text-[15px] font-semibold">Altr <AiMark /></Link><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/45"><ArrowLeft className="h-4 w-4" />Dashboard</Link></header>
      <section className="relative z-10 mx-auto max-w-5xl">
        <p className="eyebrow">BILLING / LEMON SQUEEZY</p>
        <h1 className="mt-4 text-5xl font-medium tracking-[-.06em]">Subscription and invoices.</h1>
        {error && <p className="mt-6 rounded-2xl border border-red-200/15 bg-red-500/10 p-4 text-sm text-red-100/80">{error}</p>}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <article className="pricing-card rounded-[2rem] p-7">
            <p className="data-label">CURRENT PLAN</p>
            <h2 className="mt-4 text-3xl font-medium capitalize">{loading ? "Loading…" : billing?.effectivePlan ?? "free"}</h2>
            <p className="mt-3 text-sm text-white/45">Status: {billing?.subscription?.status ?? "no subscription"}</p>
            <p className="mt-2 text-sm text-white/35">Renews: {date(billing?.subscription?.renewsAt ?? null)}</p>
            <p className="mt-2 text-sm text-white/35">Ends: {date(billing?.subscription?.endsAt ?? null)}</p>
            <p className="mt-2 text-sm text-white/35">Trial ends: {date(billing?.subscription?.trialEndsAt ?? null)}</p>
            {billing?.subscription?.testMode && <p className="mt-3 text-xs uppercase tracking-[.16em] text-amber-200/70">Test mode</p>}
            <div className="mt-7 flex flex-wrap gap-3">
              {billing?.subscription?.canManage && <button onClick={() => void openPortal()} className="future-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm">Manage subscription <ExternalLink className="h-4 w-4" /></button>}
              <button onClick={() => void load()} className="glass-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm"><RefreshCcw className="h-4 w-4" />Refresh</button>
            </div>
          </article>
          <article className="pricing-card rounded-[2rem] p-7">
            <p className="data-label">INVOICES</p>
            <div className="mt-5 space-y-3">
              {billing?.invoices?.length ? billing.invoices.map((invoice) => <div key={invoice.id} className="flex items-center justify-between rounded-2xl border border-white/[.07] bg-white/[.025] px-4 py-3 text-sm text-white/50"><span>{(invoice.amount / 100).toFixed(2)} {invoice.currency}</span>{invoice.receiptUrl ? <a href={invoice.receiptUrl} target="_blank" rel="noreferrer" className="text-cyan-100/70">{invoice.status}</a> : <span>{invoice.status}</span>}</div>) : <p className="text-sm leading-6 text-white/35">No verified invoices yet.</p>}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
