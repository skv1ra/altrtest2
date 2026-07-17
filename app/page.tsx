"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, LockKeyhole, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { AltrShardScene } from "@/components/AltrShardScene";
import { AltrLogo, Navigation } from "@/components/Navigation";
import { ReferenceHeroScene } from "@/components/ReferenceHeroScene";
import { useLang } from "@/lib/i18n/lang-store";

const copy = {
  EN: {
    heroA: "Your past learns",
    heroB: "to remain.",
    subtitle: "A digital continuation of you, shaped by memory, style, and time.",
    cta: "Create your Altr",
    free: "Free to create",
    productTitle: "It learns your patterns. Then it acts.",
    productBody: "Messages, decisions and memories become practical context — so Altr can move work forward instead of only suggesting what to do.",
    demoLabel: "Memory → Understanding → Action",
    demoTitle: "A real response, built from your context.",
    incoming: "This delay is creating problems for our launch. What are you going to do about it?",
    response: "You’re right to push on this. I’ve moved the final review forward and can confirm the updated delivery by 16:00 today. If anything changes, I’ll tell you before you need to ask.",
    sent: "Sent with approval",
    memoryTitle: "Everything you were becomes context.",
    memoryBody: "People, promises, preferences and previous decisions stay connected — without turning your life into a dashboard of charts.",
    privacyTitle: "Your data remains yours.",
    privacyBody: "Altr works inside the boundaries you define. Nothing is connected, remembered or acted on without your permission.",
    pricingTitle: "One Altr. More capable with time.",
    pricingBody: "Create your account and personality profile for free. Upgrade only when you are ready for deeper memory and more actions.",
    plan: "Personal",
    planPrice: "$20",
    perMonth: "per month",
    planFeatures: ["Context-aware communication", "Connected personal memory", "Routine actions and approvals", "Continuous personalization"],
    enterprise: "Work and Enterprise are available by request.",
    finalTitle: "It begins with what you leave behind.",
    footer: ["Product", "How it works", "Pricing", "Privacy", "Terms", "Contact", "Log in"],
  },
  UA: {
    heroA: "Твоє минуле вчиться",
    heroB: "залишатися.",
    subtitle: "Цифрове продовження тебе, сформоване памʼяттю, стилем і часом.",
    cta: "Створити свій Altr",
    free: "Створення безкоштовне",
    productTitle: "Він вивчає твої патерни. Потім діє.",
    productBody: "Повідомлення, рішення й спогади стають практичним контекстом — щоб Altr рухав роботу вперед, а не лише радив, що робити.",
    demoLabel: "Памʼять → Розуміння → Дія",
    demoTitle: "Жива відповідь, створена з твого контексту.",
    incoming: "Ця затримка створює проблеми для запуску. Що ви будете з цим робити?",
    response: "Ви справедливо на цьому наголошуєте. Я переніс фінальну перевірку раніше й підтверджу оновлений термін сьогодні до 16:00. Якщо щось зміниться, повідомлю ще до того, як вам доведеться питати.",
    sent: "Надіслано після підтвердження",
    memoryTitle: "Усе, чим ти був, стає контекстом.",
    memoryBody: "Люди, обіцянки, вподобання та минулі рішення залишаються повʼязаними — без перетворення твого життя на графіки.",
    privacyTitle: "Твої дані залишаються твоїми.",
    privacyBody: "Altr працює лише в межах, які визначаєш ти. Нічого не підключається, не запамʼятовується й не виконується без дозволу.",
    pricingTitle: "Один Altr. З часом — більше можливостей.",
    pricingBody: "Акаунт і перший профіль особистості створюються безкоштовно. Платиш лише тоді, коли потрібна глибша памʼять і більше дій.",
    plan: "Personal",
    planPrice: "$20",
    perMonth: "на місяць",
    planFeatures: ["Комунікація з урахуванням контексту", "Повʼязана особиста памʼять", "Рутинні дії та підтвердження", "Постійна персоналізація"],
    enterprise: "Work та Enterprise — за запитом.",
    finalTitle: "Усе починається з того, що ти залишаєш після себе.",
    footer: ["Продукт", "Як працює", "Ціни", "Приватність", "Умови", "Контакти", "Увійти"],
  },
} as const;

export default function HomePage() {
  const [lang, setLang] = useLang("EN");
  const reducedMotion = Boolean(useReducedMotion());
  const t = copy[lang];

  return (
    <main id="top" className="landing-page">
      <Navigation lang={lang} setLang={setLang} />

      <section className="landing-hero landing-hero-reference">
        <ReferenceHeroScene />
        <div className="landing-hero-copy landing-hero-copy-reference">
          <motion.h1 initial={reducedMotion ? false : { opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <span>{t.heroA}</span>
            <span>{t.heroB}</span>
          </motion.h1>
          <motion.p className="landing-hero-subtitle" initial={reducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>{t.subtitle}</motion.p>
          <motion.div className="landing-cta-wrap landing-cta-reference" initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Link href="/auth?mode=register" className="primary-button hero-reference-button">{t.cta}</Link>
          </motion.div>
        </div>
        <a href="#product" className="landing-scroll-indicator" aria-label="Scroll to product"><span /></a>
      </section>

      <section id="product" className="landing-statement section-shell">
        <p className="section-index">01 / Product</p>
        <h2>{t.productTitle}</h2>
        <p>{t.productBody}</p>
      </section>

      <section id="how" className="landing-demo section-shell">
        <div className="section-heading">
          <p className="section-index">02 / {t.demoLabel}</p>
          <h2>{t.demoTitle}</h2>
        </div>
        <div className="demo-stage">
          <div className="demo-context-rail" aria-label="Context used">
            <span>Client history</span>
            <span>Previous decision</span>
            <span>Communication style</span>
          </div>
          <div className="demo-conversation">
            <div className="demo-message incoming"><span>Client · 09:42</span><p>{t.incoming}</p></div>
            <div className="demo-action-line"><Sparkles className="h-4 w-4" />Altr connected three relevant memories</div>
            <div className="demo-message outgoing"><span>Altr · ready</span><p>{t.response}</p><div className="demo-sent"><Send className="h-3.5 w-3.5" />{t.sent}</div></div>
          </div>
        </div>
      </section>

      <section className="landing-memory">
        <div className="section-shell landing-memory-grid">
          <div>
            <p className="section-index">03 / Memory</p>
            <h2>{t.memoryTitle}</h2>
            <p>{t.memoryBody}</p>
            <Link href="/memory" className="text-link">Explore memory <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <AltrShardScene variant="compact" />
        </div>
      </section>

      <section className="landing-privacy section-shell">
        <div className="privacy-boundary" aria-hidden="true">
          <span className="privacy-core"><AltrLogo compact /></span>
          <span className="privacy-orbit orbit-one" />
          <span className="privacy-orbit orbit-two" />
          <span className="privacy-memory memory-one">message</span>
          <span className="privacy-memory memory-two">decision</span>
          <span className="privacy-memory memory-three">person</span>
        </div>
        <div>
          <p className="section-index">04 / Privacy</p>
          <h2>{t.privacyTitle}</h2>
          <p>{t.privacyBody}</p>
          <div className="privacy-note"><LockKeyhole className="h-4 w-4" />Permission remains visible and reversible.</div>
        </div>
      </section>

      <section id="pricing" className="landing-pricing section-shell">
        <div className="section-heading">
          <p className="section-index">05 / Pricing</p>
          <h2>{t.pricingTitle}</h2>
          <p>{t.pricingBody}</p>
        </div>
        <div className="pricing-presentation">
          <div>
            <p className="pricing-plan-name">{t.plan}</p>
            <p className="pricing-price"><strong>{t.planPrice}</strong><span>{t.perMonth}</span></p>
            <ul>{t.planFeatures.map((feature) => <li key={feature}><Check className="h-4 w-4" />{feature}</li>)}</ul>
          </div>
          <div className="pricing-actions">
            <Link href="/pricing" className="primary-button">View plan <ArrowRight className="h-4 w-4" /></Link>
            <p>{t.enterprise}</p>
          </div>
        </div>
      </section>

      <section className="landing-final">
        <AltrShardScene variant="artifact" />
        <div className="landing-final-copy">
          <h2>{t.finalTitle}</h2>
          <Link href="/auth?mode=register" className="primary-button">{t.cta}<ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="section-shell">
          <AltrLogo />
          <nav aria-label="Footer navigation">
            <a href="#product">{t.footer[0]}</a>
            <a href="#how">{t.footer[1]}</a>
            <a href="#pricing">{t.footer[2]}</a>
            <Link href="/privacy">{t.footer[3]}</Link>
            <Link href="/terms">{t.footer[4]}</Link>
            <a href="mailto:hello@altr.app">{t.footer[5]}</a>
            <Link href="/auth?mode=login">{t.footer[6]}</Link>
          </nav>
          <p>© 2026 Altr</p>
        </div>
      </footer>
    </main>
  );
}
