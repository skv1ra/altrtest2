import { XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AiMark } from "@/components/Navigation";

export default function PaymentCancelPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05080c] px-5 py-16 text-white">
      <div className="account-grid pointer-events-none fixed inset-0" />
      <section className="pricing-card relative z-10 w-full max-w-xl rounded-[2rem] p-8 text-center md:p-12">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2 text-[15px] font-semibold">Altr <AiMark /></Link>
        <XCircle className="mx-auto h-14 w-14 text-red-100/65" />
        <p className="eyebrow mt-7">PAYMENT FAILED</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-.055em]">Оплату не завершено.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/42">Картку не було списано або платіж скасовано. Можна повернутися до тарифів і спробувати ще раз.</p>
        <Link href="/pricing" className="future-button mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm"><ArrowLeft className="h-4 w-4" />Back to Pricing</Link>
      </section>
    </main>
  );
}
