import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { AiMark } from "@/components/Navigation";

export default function PaymentSuccessPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05080c] px-5 py-16 text-white">
      <div className="account-grid pointer-events-none fixed inset-0" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(47,160,255,.16),transparent_34%)]" />
      <section className="pricing-card relative z-10 w-full max-w-2xl rounded-[2rem] p-8 text-center md:p-12">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2 text-[15px] font-semibold">Altr <AiMark /></Link>
        <CheckCircle2 className="mx-auto h-14 w-14 text-cyan-100/70" />
        <p className="eyebrow mt-7">PAYMENT RETURN</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-.055em] md:text-5xl">Payment received by checkout.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/42">Your plan will appear after the verified Lemon Squeezy webhook updates the server. This page never activates premium access from URL parameters or browser state.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/dashboard" className="future-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm">Go to Dashboard <ArrowRight className="h-4 w-4" /></Link><Link href="/pricing" className="glass-button inline-flex items-center justify-center rounded-full px-6 py-3 text-sm">Check plan</Link></div>
      </section>
    </main>
  );
}
