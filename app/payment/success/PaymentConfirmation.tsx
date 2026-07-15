"use client";

import Link from "next/link";
import { CheckCircle2, Loader2, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type BillingState = { effectivePlan: string; hasPremium: boolean; subscription: { status: string } | null };

export function PaymentConfirmation() {
  const [billing, setBilling] = useState<BillingState | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch("/api/billing/me", { cache: "no-store" });
    if (!response.ok) throw new Error("BILLING_STATE_FAILED");
    setBilling(await response.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    let stopped = false;
    let count = 0;
    const poll = async () => {
      try { if (!stopped) await load(); } catch { if (!stopped) setLoading(false); }
      count += 1;
      if (!stopped && count < 10) window.setTimeout(poll, 3000);
    };
    void poll();
    return () => { stopped = true; };
  }, [load]);

  const confirmed = Boolean(billing?.hasPremium);
  return (
    <section className="pricing-card relative z-10 w-full max-w-2xl rounded-[2rem] p-8 text-center md:p-12">
      {confirmed ? <CheckCircle2 className="mx-auto h-14 w-14 text-cyan-100/70" /> : <Loader2 className="mx-auto h-14 w-14 animate-spin text-cyan-100/70" />}
      <p className="eyebrow mt-7">LEMON SQUEEZY / PAYMENT</p>
      <h1 className="mt-4 text-4xl font-medium tracking-[-.055em] md:text-5xl">{confirmed ? `Plan ${billing?.effectivePlan} is active.` : "Payment is being confirmed"}</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/42">{confirmed ? "Premium access appeared only after the verified webhook updated the database." : "This page cannot activate a plan. A delayed webhook may take a short time to arrive."}</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button onClick={() => { setLoading(true); void load(); }} disabled={loading} className="glass-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm disabled:opacity-50"><RefreshCcw className="h-4 w-4" />Refresh</button>
        <Link href={confirmed ? "/dashboard" : "/billing"} className="future-button inline-flex items-center justify-center rounded-full px-6 py-3 text-sm">{confirmed ? "Go to dashboard" : "Open billing"}</Link>
      </div>
    </section>
  );
}
