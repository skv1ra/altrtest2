"use client";

import { ArrowLeft, FileText, Printer } from "lucide-react";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { AiMark } from "@/components/Navigation";
import { CookiePreferencesButton } from "@/components/legal/CookiePreferencesButton";
import { LanguageSwitch } from "@/components/legal/LanguageSwitch";
import { getStoredLanguage, type Lang } from "@/lib/i18n/lang-store";
import { getCookiesContent } from "@/lib/legal/cookies-content";
import { getDeletionContent } from "@/lib/legal/deletion-content";
import { getMissingLegalConfigKeys, hasMissingLegalConfig } from "@/lib/legal/legal-config";
import { getPrivacyContent } from "@/lib/legal/privacy-content";
import { getTermsContent } from "@/lib/legal/terms-content";
import type { LegalBlock, LegalDocument } from "@/lib/legal/types";

export type LegalPageKind = "privacy" | "terms" | "cookies" | "data-deletion";

const labels = {
  EN: {
    back: "Back to Altr", toc: "On this page", version: "Version", effective: "Effective", updated: "Last updated", print: "Print / save PDF",
    setup: "Development notice", setupBody: "Mandatory legal configuration is incomplete. Fill the values listed in LEGAL_SETUP.md before production launch.", missing: "Missing fields", legal: "Legal",
    privacy: "Privacy", terms: "Terms", cookies: "Cookies", deletion: "Data deletion", request: "Delete my data", preferences: "Cookie preferences",
    ownerReview: "These documents require owner and qualified legal review before commercial launch.",
  },
  UA: {
    back: "Назад до Altr", toc: "На цій сторінці", version: "Версія", effective: "Набуває чинності", updated: "Оновлено", print: "Друк / зберегти PDF",
    setup: "Повідомлення для розробки", setupBody: "Обовʼязкова юридична конфігурація не заповнена. До production-запуску внеси значення з LEGAL_SETUP.md.", missing: "Незаповнені поля", legal: "Legal",
    privacy: "Приватність", terms: "Умови", cookies: "Cookie", deletion: "Видалення даних", request: "Видалити мої дані", preferences: "Налаштування cookie",
    ownerReview: "Перед комерційним запуском ці документи потребують перевірки власника та кваліфікованого юриста.",
  },
} as const;

function resolveDocument(kind: LegalPageKind, lang: Lang): LegalDocument {
  if (kind === "privacy") return getPrivacyContent(lang);
  if (kind === "terms") return getTermsContent(lang);
  if (kind === "cookies") return getCookiesContent(lang);
  return getDeletionContent(lang);
}

function inline(text: string): ReactNode {
  const pattern = /(\/(?:privacy|terms|cookies|data-deletion|delete-data)\b|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;
  return text.split(pattern).map((part, index) => {
    if (/^\/(privacy|terms|cookies|data-deletion|delete-data)\b/.test(part)) return <Link key={`${part}-${index}`} href={part} className="legal-inline-link">{part}</Link>;
    if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(part)) return <a key={`${part}-${index}`} href={`mailto:${part}`} className="legal-inline-link">{part}</a>;
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function LegalBlockView({ block }: { block: LegalBlock }) {
  if (block.type === "paragraph") return <p className="legal-paragraph">{inline(block.text)}</p>;
  if (block.type === "note") return <aside className="legal-note"><span className="status-dot-css" /><p>{inline(block.text)}</p></aside>;
  if (block.type === "list") {
    const ListTag = block.ordered ? "ol" : "ul";
    return <ListTag className={`legal-list ${block.ordered ? "legal-list-ordered" : ""}`}>{block.items.map((item, index) => <li key={`${index}-${item}`}>{inline(item)}</li>)}</ListTag>;
  }
  return (
    <div className="legal-table-wrap">
      <table className="legal-table">
        <thead><tr>{block.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
        <tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{inline(cell)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function LegalDocumentPage({ kind }: { kind: LegalPageKind }) {
  const [lang, setLang] = useState<Lang>("EN");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = getStoredLanguage();
    setLang(stored);
    document.documentElement.lang = stored === "UA" ? "uk" : "en";
    setReady(true);
  }, []);

  const content = useMemo(() => resolveDocument(kind, lang), [kind, lang]);
  const t = labels[lang];
  const missing = getMissingLegalConfigKeys();
  const showDevelopmentWarning = process.env.NODE_ENV !== "production" && hasMissingLegalConfig();

  return (
    <main className="legal-page min-h-screen bg-[#05080c] text-white selection:bg-cyan-200 selection:text-black">
      <div className="legal-page-grid pointer-events-none fixed inset-0" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_78%_8%,rgba(47,160,255,.11),transparent_30%),radial-gradient(circle_at_18%_45%,rgba(103,232,249,.045),transparent_32%)]" />

      <header className="legal-control-bar sticky top-0 z-40 border-b border-cyan-100/[.06] bg-[#05080c]/84 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold"><span>Altr</span><AiMark /><span className="hidden text-[10px] font-normal uppercase tracking-[.18em] text-white/25 sm:inline">{t.legal}</span></Link>
          <nav className="hidden items-center gap-5 text-xs text-white/38 lg:flex">
            <Link href="/privacy" className="legal-nav-link">{t.privacy}</Link><Link href="/terms" className="legal-nav-link">{t.terms}</Link><Link href="/cookies" className="legal-nav-link">{t.cookies}</Link><Link href="/data-deletion" className="legal-nav-link">{t.deletion}</Link>
          </nav>
          <div className="flex items-center gap-4"><LanguageSwitch lang={lang} onChange={setLang} /><Link href="/" className="hidden items-center gap-2 text-xs uppercase tracking-[.12em] text-white/35 transition hover:text-white sm:inline-flex"><ArrowLeft className="h-3.5 w-3.5" />{t.back}</Link></div>
        </div>
      </header>

      <div className={`relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-12 transition-opacity md:px-8 md:pt-20 ${ready ? "opacity-100" : "opacity-0"}`}>
        {showDevelopmentWarning && <section className="legal-development-warning mb-8"><div><p className="data-label">{t.setup}</p><p className="mt-2 text-sm leading-6 text-amber-50/70">{t.setupBody}</p><p className="mt-2 text-xs text-amber-50/45">{t.missing}: {missing.join(", ")}</p></div></section>}

        <section className="legal-hero">
          <div><p className="eyebrow">{content.eyebrow}</p><h1 className="mt-6 max-w-4xl text-balance text-5xl font-medium leading-[.98] tracking-[-.065em] md:text-7xl">{content.title}</h1><div className="mt-8 flex flex-wrap gap-2 text-[11px] uppercase tracking-[.13em] text-white/34"><span className="legal-meta-chip">{t.version} {content.version}</span>{content.effectiveDate && <span className="legal-meta-chip">{t.effective}: {content.effectiveDate}</span>}<span className="legal-meta-chip">{t.updated}: {content.lastUpdated}</span></div></div>
          <button type="button" onClick={() => window.print()} className="glass-button inline-flex h-fit items-center gap-2 rounded-full px-4 py-3 text-xs"><Printer className="h-4 w-4" />{t.print}</button>
        </section>

        <div className="mt-12 grid gap-10 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-16">
          <aside className="lg:sticky lg:top-28 lg:h-fit"><details className="legal-toc rounded-2xl" open><summary className="flex cursor-pointer items-center gap-2 text-xs uppercase tracking-[.16em] text-white/45"><FileText className="h-4 w-4" />{t.toc}</summary><nav className="mt-5 space-y-1.5">{content.sections.map((section, index) => <a key={section.id} href={`#${section.id}`} className="legal-toc-link"><span>{String(index + 1).padStart(2, "0")}</span>{section.heading}</a>)}</nav></details></aside>
          <article className="min-w-0"><section className="legal-intro-panel">{content.intro.map((block, index) => <LegalBlockView key={index} block={block} />)}</section><div className="mt-6 space-y-5">{content.sections.map((section, sectionIndex) => <section id={section.id} key={section.id} className="legal-section scroll-mt-28"><div className="mb-6 flex items-start gap-4"><span className="data-label mt-1">{String(sectionIndex + 1).padStart(2, "0")}</span><h2 className="text-2xl font-medium tracking-[-.035em] text-white md:text-3xl">{section.heading}</h2></div><div className="space-y-4">{section.blocks.map((block, blockIndex) => <LegalBlockView key={blockIndex} block={block} />)}</div></section>)}</div></article>
        </div>
      </div>

      <footer className="relative z-10 border-t border-cyan-100/[.06] px-5 py-10"><div className="mx-auto flex max-w-7xl flex-col gap-7 md:flex-row md:items-end md:justify-between"><div><Link href="/" className="flex items-center gap-2 text-sm font-semibold"><span>Altr</span><AiMark /></Link><p className="mt-4 max-w-xl text-xs leading-5 text-white/30">{t.ownerReview}</p></div><div className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-white/35"><Link href="/privacy" className="footer-link">{t.privacy}</Link><Link href="/terms" className="footer-link">{t.terms}</Link><Link href="/cookies" className="footer-link">{t.cookies}</Link><Link href="/data-deletion" className="footer-link">{t.deletion}</Link><Link href="/delete-data" className="footer-link">{t.request}</Link><CookiePreferencesButton className="footer-link">{t.preferences}</CookiePreferencesButton></div></div></footer>
    </main>
  );
}
