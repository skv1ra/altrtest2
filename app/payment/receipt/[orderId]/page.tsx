"use client";

import { ArrowLeft, Download, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AiMark } from "@/components/Navigation";
import { BillingInvoice, getCurrentProfile } from "@/lib/auth";

type ServerInvoice = {
  order_id: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  created_at?: string;
  paid_at?: string | null;
  receipt_url?: string | null;
};

export default function ReceiptPage() {
  const params = useParams<{ orderId: string }>();
  const [localInvoices, setLocalInvoices] = useState<BillingInvoice[]>([]);
  const [serverInvoice, setServerInvoice] = useState<ServerInvoice | null>(null);
  const [serverMessage, setServerMessage] = useState("");

  useEffect(() => {
    let active = true;
    getCurrentProfile().then(profile => {
      if (active) setLocalInvoices(profile?.invoices ?? []);
    });
    fetch(`/api/billing/receipt/${encodeURIComponent(params.orderId)}`, { cache: "no-store" })
      .then(response => response.json())
      .then(result => {
        if (result.invoice) setServerInvoice(result.invoice);
        else if (result.configured === false) setServerMessage("Supabase ще не підключений. Показуємо локальну квитанцію MVP.");
      })
      .catch(() => setServerMessage("Не вдалося отримати квитанцію з сервера. Показуємо локальні дані, якщо вони є."));
    return () => { active = false; };
  }, [params.orderId]);

  const localInvoice = useMemo(() => localInvoices.find(item => item.orderId === params.orderId), [localInvoices, params.orderId]);
  const invoice = serverInvoice ? {
    orderId: serverInvoice.order_id,
    plan: serverInvoice.plan,
    amount: serverInvoice.amount,
    currency: serverInvoice.currency,
    status: serverInvoice.status,
    createdAt: serverInvoice.created_at,
    paidAt: serverInvoice.paid_at,
  } : localInvoice ? {
    orderId: localInvoice.orderId,
    plan: localInvoice.plan,
    amount: localInvoice.amount,
    currency: localInvoice.currency,
    status: localInvoice.status,
    createdAt: localInvoice.createdAt,
    paidAt: localInvoice.paidAt,
  } : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05080c] px-5 py-12 text-white">
      <div className="account-grid pointer-events-none fixed inset-0" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <header className="flex items-center justify-between"><Link href="/" className="flex items-center gap-2 text-[15px] font-semibold">Altr <AiMark /></Link><Link href="/pricing" className="inline-flex items-center gap-2 text-xs uppercase tracking-[.16em] text-white/42 hover:text-white"><ArrowLeft className="h-4 w-4" />Pricing</Link></header>
        <section className="pricing-card mt-12 rounded-[2rem] p-8 md:p-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start"><div><p className="eyebrow">INVOICE / RECEIPT</p><h1 className="mt-4 text-4xl font-medium tracking-[-.055em]">Квитанція Altr</h1><p className="mt-3 text-sm text-white/34">Квитанція береться із Supabase, а якщо база ще не підключена — з локального MVP-акаунта.</p></div><ReceiptText className="h-12 w-12 text-cyan-100/55" /></div>
          {serverMessage && <p className="mt-6 rounded-2xl border border-cyan-100/[.08] bg-cyan-200/[.035] p-4 text-sm text-cyan-50/60">{serverMessage}</p>}
          {invoice ? <div className="mt-10 space-y-4 text-sm"><Row label="Order ID" value={invoice.orderId} /><Row label="Plan" value={String(invoice.plan).toUpperCase()} /><Row label="Amount" value={`${invoice.amount} ${invoice.currency}`} /><Row label="Status" value={String(invoice.status).toUpperCase()} /><Row label="Created" value={invoice.createdAt ? new Date(invoice.createdAt).toLocaleString("uk-UA") : "—"} /><Row label="Paid" value={invoice.paidAt ? new Date(invoice.paidAt).toLocaleString("uk-UA") : "—"} /></div> : <p className="mt-8 rounded-2xl border border-white/[.06] bg-white/[.025] p-5 text-sm text-white/42">Квитанцію не знайдено. Якщо оплата щойно пройшла, зачекайте callback від Lemon Squeezy і оновіть сторінку.</p>}
          <button onClick={() => window.print()} className="glass-button mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm"><Download className="h-4 w-4" />Print / Save PDF</button>
        </section>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-5 border-b border-white/[.06] pb-4"><span className="text-white/32">{label}</span><span className="text-right text-white/72">{value}</span></div>;
}
