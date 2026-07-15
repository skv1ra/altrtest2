import Link from "next/link";
import { redirect } from "next/navigation";
import { AiMark } from "@/components/Navigation";
import { requireUser } from "@/lib/supabase/server";
import { PaymentConfirmation } from "@/app/payment/success/PaymentConfirmation";

export default async function PaymentSuccessPage() {
  try { await requireUser(); } catch { redirect("/auth?next=/payment/success"); }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05080c] px-5 py-16 text-white">
      <div className="account-grid pointer-events-none fixed inset-0" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(47,160,255,.16),transparent_34%)]" />
      <div className="relative z-10 w-full max-w-2xl">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2 text-[15px] font-semibold">Altr <AiMark /></Link>
        <PaymentConfirmation />
      </div>
    </main>
  );
}
