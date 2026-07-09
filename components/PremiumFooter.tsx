"use client";

import { AiMark, type Lang } from "./Navigation";

const footerCopy = {
  EN: {
    headline: "Personal AI that handles the patterns, not your identity.",
    subline: "Start building your Altr today.",
    button: "Create Your Second Self",
    status: "All systems learning",
    note: "Private by default. You approve what Altr can learn and where it can respond.",
    columns: {
      product: ["Product", "Live demo", "Memory", "Vision"],
      resources: ["Resources", "Manifesto", "Security", "Roadmap"],
      legal: ["Legal", "Privacy", "Terms", "Data controls"],
    },
    copyright: "© 2026 Altr. All rights reserved.",
  },
  UA: {
    headline: "Персональний AI, який бере на себе шаблони, а не твою особистість.",
    subline: "Почни будувати свого Altr сьогодні.",
    button: "Створити другого себе",
    status: "Система навчається",
    note: "Приватність за замовчуванням. Ти сам дозволяєш, що Altr може вивчати і де відповідати.",
    columns: {
      product: ["Продукт", "Демо", "Памʼять", "Візія"],
      resources: ["Ресурси", "Маніфест", "Безпека", "Роадмап"],
      legal: ["Правові", "Privacy", "Terms", "Контроль даних"],
    },
    copyright: "© 2026 Altr. Усі права захищені.",
  },
} as const;

const footerLinks = {
  product: ["#product", "#product", "#memory", "#vision"],
  resources: ["#", "#", "#", "#"],
  legal: ["#", "#", "#", "#"],
};

function FloatingKey({ label, className }: { label: string; className: string }) {
  return (
    <div className={`footer-key pointer-events-none absolute grid place-items-center rounded-[1.35rem] border border-white/[0.08] bg-white/[0.055] text-white/42 shadow-[inset_0_1px_0_rgba(255,255,255,.09),0_24px_70px_rgba(0,0,0,.45)] backdrop-blur-xl ${className}`}>
      <span className="text-3xl font-light tracking-[-0.06em] md:text-4xl">{label}</span>
    </div>
  );
}

function FooterColumn({ title, items, links }: { title: string; items: readonly string[]; links: readonly string[] }) {
  return (
    <div>
      <h3 className="mb-5 text-sm font-medium tracking-[-0.02em] text-white/88">{title}</h3>
      <div className="flex flex-col gap-4 text-sm text-white/42">
        {items.slice(1).map((item, index) => (
          <a key={item} href={links[index + 1]} className="footer-link w-fit">
            {item}
          </a>
        ))}
      </div>
    </div>
  );
}

export function PremiumFooter({ lang }: { lang: Lang }) {
  const t = footerCopy[lang];

  return (
    <footer className="relative z-10 overflow-hidden border-t border-white/[0.055] bg-[#090909] px-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200/18 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-blue-500/[0.055] blur-[110px]" />
      <div className="pointer-events-none absolute right-[7%] top-8 h-56 w-56 rounded-full bg-violet-400/[0.035] blur-[95px]" />

      <section className="relative mx-auto min-h-[390px] max-w-7xl border-b border-white/[0.065] py-16 md:min-h-[460px] md:py-20">
        <div className="relative z-10 max-w-3xl">
          <p className="mb-4 flex items-center gap-3 text-sm text-white/36">
            <span>Altr</span>
            <AiMark />
            <span>{lang === "EN" ? "quiet intelligence layer" : "тихий intelligence layer"}</span>
          </p>
          <h2 className="max-w-4xl text-balance text-4xl font-medium leading-[1.02] tracking-[-0.065em] text-white md:text-6xl lg:text-[4.8rem]">
            {t.headline}
          </h2>
          <p className="mt-3 text-2xl font-medium tracking-[-0.055em] text-white/42 md:text-4xl">
            {t.subline}
          </p>
          <a href="#product" className="premium-button mt-9 inline-flex items-center rounded-full px-5 py-3.5 text-sm font-medium text-white transition duration-500">
            <span>{t.button}</span>
            <span className="ml-3 h-1.5 w-1.5 rounded-full bg-blue-200 shadow-[0_0_14px_rgba(147,197,253,.85)]" />
          </a>
        </div>

        <div className="footer-keys pointer-events-none absolute inset-0 hidden md:block">
          <FloatingKey label="↵" className="right-[7%] top-[4%] h-28 w-28 rotate-[-10deg]" />
          <FloatingKey label="⌘" className="right-[27%] top-[35%] h-24 w-24 rotate-[13deg] footer-key-bright" />
          <FloatingKey label="↗" className="right-[3%] bottom-[13%] h-20 w-20 rotate-[8deg] opacity-55" />
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-12 py-12 md:grid-cols-[1.15fr_.85fr_.85fr_.85fr] md:py-16">
        <div className="flex min-h-[220px] flex-col justify-between">
          <a href="#top" className="flex w-fit items-center gap-2 text-xl font-semibold tracking-[-0.05em] text-white">
            <span>Altr</span>
            <AiMark />
          </a>

          <div className="mt-12 space-y-7">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-sm text-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,.05)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.64)]" />
              {t.status}
            </div>
            <p className="max-w-xs text-sm leading-6 text-white/36">{t.note}</p>
          </div>
        </div>

        <FooterColumn title={t.columns.product[0]} items={t.columns.product} links={footerLinks.product} />
        <FooterColumn title={t.columns.resources[0]} items={t.columns.resources} links={footerLinks.resources} />
        <FooterColumn title={t.columns.legal[0]} items={t.columns.legal} links={footerLinks.legal} />
      </section>

      <section className="relative mx-auto flex max-w-7xl flex-col gap-6 border-t border-white/[0.055] py-7 text-sm text-white/34 md:flex-row md:items-center md:justify-between">
        <p>{t.copyright}</p>
        <div className="flex items-center gap-5">
          <a href="https://x.com" className="footer-social" aria-label="X">𝕏</a>
          <a href="https://github.com" className="footer-social" aria-label="GitHub">GitHub</a>
        </div>
      </section>
    </footer>
  );
}
