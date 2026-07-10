import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { legalConfig, legalDetailsComplete } from "@/lib/legal";
import { AiMark } from "./Navigation";

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="legal-section"><h2>{title}</h2><div>{children}</div></section>;
}

export function LegalPage({ eyebrow, title, summary, children }: { eyebrow: string; title: string; summary: string; children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05080c] text-white">
      <div className="account-grid pointer-events-none fixed inset-0 opacity-60" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_80%_5%,rgba(47,160,255,.1),transparent_30%)]" />
      <header className="relative z-20 mx-auto flex h-24 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold">Altr <AiMark /></Link>
        <Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[.16em] text-white/42 transition hover:text-white"><ArrowLeft className="h-4 w-4" />На головну</Link>
      </header>

      <article className="legal-document relative z-10 mx-auto max-w-4xl px-5 pb-24 pt-10">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-5 text-balance text-5xl font-medium leading-[.98] tracking-[-.06em] md:text-7xl">{title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/45">{summary}</p>
        <div className="mt-7 flex flex-wrap gap-3 text-xs text-white/30"><span>Версія: 10.07.2026</span><span>•</span><span>Чинна з {legalConfig.effectiveDate}</span></div>

        {!legalDetailsComplete && <div className="legal-warning mt-9"><AlertTriangle className="h-5 w-5 flex-none" /><div><strong>Потрібне заповнення перед публічним запуском</strong><p>У файлі lib/legal.ts вкажіть юридичну назву власника Altr, адресу, контактні email, застосовне право та порядок вирішення спорів. Без цих реквізитів документи не є фінально готовими.</p></div></div>}

        <div className="mt-12 space-y-4">{children}</div>

        <footer className="mt-12 rounded-[1.5rem] border border-cyan-100/[.08] bg-white/[.025] p-6 text-sm leading-7 text-white/42">
          <p><strong className="text-white/70">Володілець даних:</strong> {legalConfig.controllerName}</p>
          <p><strong className="text-white/70">Адреса:</strong> {legalConfig.controllerAddress}</p>
          <p><strong className="text-white/70">Privacy:</strong> {legalConfig.privacyEmail}</p>
          <p><strong className="text-white/70">Support:</strong> {legalConfig.supportEmail}</p>
        </footer>

        <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-cyan-100/55">
          <Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Use</Link><Link href="/cookies">Cookie Policy</Link><Link href="/data-deletion">Data Deletion</Link><Link href="/data-deletion/request">Запит на видалення</Link>
        </nav>
      </article>
    </main>
  );
}
