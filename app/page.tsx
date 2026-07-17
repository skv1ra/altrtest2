"use client";

import { AnimatePresence, MotionConfig, motion, type MotionProps } from "framer-motion";
import { ArrowRight, Check, ChevronDown, Pause } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { HeroSequence } from "@/components/HeroSequence";
import { AiMark, Navigation } from "@/components/Navigation";
import { homeCopy } from "@/lib/i18n/home-copy";
import { useLang } from "@/lib/i18n/lang-store";

export default function Home() {
  const [lang, setLang] = useLang("UA");
  const [openFaq, setOpenFaq] = useState(0);
  const t = homeCopy[lang];
  const reveal: MotionProps = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-90px" },
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const },
  };

  return (
    <MotionConfig reducedMotion="user">
      <main id="top" className="relative min-h-screen overflow-hidden bg-[#040609] text-white">
        <Navigation lang={lang} setLang={setLang} />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,.12),transparent_34%),linear-gradient(180deg,#070a0e,#030405_72%)]"
        />

        <section className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] flex-col justify-center px-5 pb-10 pt-28 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72 }}
            className="mx-auto max-w-5xl text-center"
          >
            <h1 className="text-balance text-6xl font-medium leading-[.9] tracking-[-.075em] md:text-8xl lg:text-[8.5rem]">
              {t.heroTitle}
              <br />
              <span className="text-sky-300">{t.heroAccent}</span>
            </h1>
            <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-white/58 md:text-xl">
              {t.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/auth?mode=register"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-sky-100 px-6 text-sm font-medium text-slate-950 transition hover:-translate-y-0.5 hover:bg-white"
              >
                {t.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#product"
                className="inline-flex min-h-12 items-center rounded-full border border-sky-200/15 bg-white/[.025] px-6 text-sm text-white/65 transition hover:border-sky-200/30 hover:bg-white/[.05]"
              >
                {t.secondary}
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.12 }}
            className="mt-10"
          >
            <HeroSequence lang={lang} />
          </motion.div>
        </section>

        <section id="product" className="relative z-10 mx-auto max-w-[1400px] px-5 py-16 lg:px-8">
          <motion.div
            {...reveal}
            className="rounded-[42px] border border-sky-200/10 bg-white/[.025] p-6 md:p-10 lg:p-14"
          >
            <div className="max-w-4xl">
              <p className="text-sm font-medium uppercase tracking-[.14em] text-sky-200/65">
                {t.sectionEyebrow}
              </p>
              <h2 className="mt-5 text-4xl font-medium leading-[1] tracking-[-.055em] md:text-6xl">
                {t.sectionTitle}
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/48">{t.sectionBody}</p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {t.features.map((feature, index) => (
                <motion.article
                  key={feature.code}
                  {...reveal}
                  transition={{ duration: 0.55, delay: index * 0.05 }}
                  className="rounded-[30px] border border-sky-200/10 bg-black/20 p-6 md:p-8"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-sky-300">0{index + 1}</span>
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-300/80 shadow-[0_0_16px_rgba(125,211,252,.65)]" />
                  </div>
                  <h3 className="mt-10 text-2xl font-medium tracking-[-.035em] md:text-3xl">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-white/46">{feature.body}</p>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="relative z-10 mx-auto max-w-[1400px] px-5 py-16 lg:px-8">
          <motion.div
            {...reveal}
            className="overflow-hidden rounded-[42px] border border-sky-200/10 bg-[linear-gradient(145deg,rgba(10,20,29,.94),rgba(3,6,9,.96))] p-6 md:p-10 lg:p-14"
          >
            <div className="max-w-4xl">
              <p className="text-sm font-medium uppercase tracking-[.14em] text-sky-200/65">
                {t.comparisonEyebrow}
              </p>
              <h2 className="mt-5 text-4xl font-medium leading-[1] tracking-[-.055em] md:text-6xl">
                {t.comparisonTitle}
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/48">{t.comparisonBody}</p>
            </div>
            <div className="mt-12 overflow-hidden rounded-[30px] border border-sky-200/10 bg-black/25">
              <div className="grid grid-cols-[1fr_1fr] border-b border-sky-200/10 text-base font-medium">
                <span className="p-5 text-white/38">{t.comparisonHeaders[0]}</span>
                <span className="border-l border-sky-200/10 p-5 text-sky-100">{t.comparisonHeaders[1]}</span>
              </div>
              {t.comparisonRows.slice(0, 4).map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1fr_1fr] border-b border-sky-200/[.07] last:border-0"
                >
                  <div className="p-5 md:p-6">
                    <strong className="block text-base font-medium text-white/70">{row.label}</strong>
                    <span className="mt-2 block text-sm leading-6 text-white/35">{row.standard}</span>
                  </div>
                  <div className="border-l border-sky-200/10 p-5 md:p-6">
                    <span className="flex items-start gap-3 text-sm leading-6 text-sky-100/75">
                      <Check className="mt-0.5 h-4 w-4 flex-none text-sky-300" />
                      {row.altr}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section id="autonomy" className="relative z-10 mx-auto max-w-[1400px] px-5 py-16 lg:px-8">
          <motion.div
            {...reveal}
            className="rounded-[42px] border border-sky-200/10 bg-white/[.025] p-6 md:p-10 lg:p-14"
          >
            <div className="max-w-4xl">
              <p className="text-sm font-medium uppercase tracking-[.14em] text-sky-200/65">
                {t.authorityEyebrow}
              </p>
              <h2 className="mt-5 text-4xl font-medium leading-[1] tracking-[-.055em] md:text-6xl">
                {t.authorityTitle}
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/48">{t.authorityBody}</p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {t.authorityLevels.map((level, index) => (
                <motion.article
                  key={level.level}
                  {...reveal}
                  transition={{ duration: 0.55, delay: index * 0.05 }}
                  className={`rounded-[28px] border p-6 ${index === 1 ? "border-sky-300/30 bg-sky-300/[.07]" : "border-sky-200/10 bg-black/20"}`}
                >
                  <span className="text-lg font-medium text-sky-300">{level.level}</span>
                  <h3 className="mt-10 text-2xl font-medium">{level.title}</h3>
                  <p className="mt-4 text-base leading-7 text-white/43">{level.body}</p>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="relative z-10 mx-auto max-w-[1400px] px-5 py-16 lg:px-8">
          <motion.div
            {...reveal}
            className="grid gap-8 rounded-[42px] border border-sky-200/10 bg-[linear-gradient(145deg,rgba(10,20,29,.94),rgba(3,6,9,.96))] p-6 md:p-10 lg:grid-cols-[1fr_360px] lg:p-14"
          >
            <div className="self-center">
              <p className="text-sm font-medium uppercase tracking-[.14em] text-sky-200/65">
                {t.securityEyebrow}
              </p>
              <h2 className="mt-5 text-4xl font-medium leading-[1] tracking-[-.055em] md:text-6xl">
                {t.securityTitle}
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/48">{t.securityBody}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {t.securityItems.slice(0, 4).map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-3 rounded-full border border-sky-200/10 bg-white/[.025] px-4 py-3 text-sm text-white/55"
                  >
                    <Check className="h-4 w-4 text-sky-300" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex min-h-[320px] flex-col justify-center rounded-[32px] border border-red-300/15 bg-red-400/[.035] p-8">
              <span className="grid h-16 w-16 place-items-center rounded-full border border-red-300/25 bg-red-300/[.04] text-red-200">
                <Pause />
              </span>
              <strong className="mt-10 text-3xl font-medium">Pause Altr</strong>
              <p className="mt-4 text-base leading-7 text-red-100/38">
                Stop all outgoing actions immediately.
              </p>
              <button className="mt-7 min-h-12 rounded-full border border-red-300/25 px-5 text-sm text-red-200 transition hover:bg-red-300/[.06]">
                Emergency stop
              </button>
            </div>
          </motion.div>
        </section>

        <section id="pricing" className="relative z-10 mx-auto max-w-[1400px] px-5 py-16 lg:px-8">
          <motion.div
            {...reveal}
            className="rounded-[42px] border border-sky-200/10 bg-white/[.025] p-6 md:p-10 lg:p-14"
          >
            <p className="text-sm font-medium uppercase tracking-[.14em] text-sky-200/65">
              {t.pricingEyebrow}
            </p>
            <h2 className="mt-5 max-w-4xl text-4xl font-medium leading-[1] tracking-[-.055em] md:text-6xl">
              {t.pricingTitle}
            </h2>
            <div className="mt-12 grid gap-4 lg:grid-cols-2">
              {t.plans.map((plan, index) => (
                <motion.article
                  key={plan.name}
                  {...reveal}
                  className={`rounded-[32px] border p-7 md:p-9 ${index === 1 ? "border-sky-300/30 bg-sky-300/[.07]" : "border-sky-200/10 bg-black/20"}`}
                >
                  <div className="text-base font-medium text-sky-300">{plan.name}</div>
                  <div className="mt-8 flex items-end gap-3">
                    <del className="text-lg text-white/25">{plan.oldPrice}</del>
                    <strong className="text-6xl font-medium tracking-[-.06em]">{plan.price}</strong>
                    <span className="mb-2 text-sm text-white/35">{plan.suffix}</span>
                  </div>
                  <p className="mt-6 min-h-14 text-base leading-7 text-white/45">{plan.description}</p>
                  <ul className="mt-7 grid gap-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-white/58">
                        <Check className="h-4 w-4 text-sky-300" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/pricing"
                    className={`mt-9 flex min-h-12 items-center justify-between rounded-full px-5 text-sm ${index === 1 ? "bg-sky-100 text-slate-950" : "border border-sky-200/15 text-white/70"}`}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="relative z-10 mx-auto max-w-[1400px] px-5 py-16 lg:px-8">
          <motion.div
            {...reveal}
            className="rounded-[42px] border border-sky-200/10 bg-[linear-gradient(145deg,rgba(10,20,29,.94),rgba(3,6,9,.96))] p-6 md:p-10 lg:p-14"
          >
            <p className="text-sm font-medium uppercase tracking-[.14em] text-sky-200/65">{t.faqEyebrow}</p>
            <h2 className="mt-5 text-4xl font-medium leading-[1] tracking-[-.055em] md:text-6xl">
              {t.faqTitle}
            </h2>
            <div className="mt-10 grid gap-3">
              {t.faq.map((item, index) => (
                <button
                  key={item.q}
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  aria-expanded={openFaq === index}
                  className="w-full rounded-[24px] border border-sky-200/10 bg-white/[.025] p-5 text-left md:p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <strong className="text-lg font-medium md:text-xl">{item.q}</strong>
                    <ChevronDown
                      className={`h-5 w-5 flex-none transition ${openFaq === index ? "rotate-180" : ""}`}
                    />
                  </div>
                  <AnimatePresence initial={false}>
                    {openFaq === index && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pt-4 text-base leading-7 text-white/46"
                      >
                        {item.a}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="relative z-10 mx-auto max-w-[1400px] px-5 py-16 lg:px-8">
          <motion.div
            {...reveal}
            className="rounded-[46px] border border-sky-200/10 bg-sky-300/[.055] px-6 py-20 text-center md:px-12 md:py-28"
          >
            <p className="text-sm font-medium uppercase tracking-[.14em] text-sky-200/65">{t.finalEyebrow}</p>
            <h2 className="mx-auto mt-5 max-w-5xl text-4xl font-medium leading-[1] tracking-[-.055em] md:text-7xl">
              {t.finalTitle}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/48">{t.finalSubtitle}</p>
            <Link
              href="/auth?mode=register"
              className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-sky-100 px-6 text-sm font-medium text-slate-950"
            >
              {t.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </section>

        <footer className="relative z-10 mx-auto grid max-w-[1400px] gap-8 px-5 py-12 text-sm text-white/35 md:grid-cols-[1fr_2fr_auto] lg:px-8">
          <a href="#top" className="flex items-center gap-2 text-base text-white">
            Altr <AiMark />
          </a>
          <nav className="flex flex-wrap content-start gap-x-6 gap-y-4">
            <a href="#product">{t.footer.product}</a>
            <a href="#product">{t.footer.how}</a>
            <Link href="/memory">{t.footer.memory}</Link>
            <a href="#autonomy">{t.footer.autonomy}</a>
            <a href="#pricing">{t.footer.pricing}</a>
            <Link href="/privacy">{t.footer.privacy}</Link>
            <Link href="/terms">{t.footer.terms}</Link>
            <Link href="/cookies">{t.footer.cookies}</Link>
            <Link href="/data-deletion">{t.footer.deletion}</Link>
          </nav>
          <p>© 2026 Altr</p>
        </footer>
      </main>
    </MotionConfig>
  );
}
