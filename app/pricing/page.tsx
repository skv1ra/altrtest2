"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check, LockKeyhole, Sparkles, UsersRound, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiMark } from "@/components/Navigation";
import { AltrProfile, getCurrentProfile, PlanId, updateCurrentProfile } from "@/lib/auth";

const plans: { id: PlanId; name: string; price: number; originalPrice?: number; label: string; description: string; features: string[]; icon: typeof Sparkles; popular?: boolean }[] = [
  {
    id: "free", name: "Безкоштовна", price: 0, label: "FREE", icon: Sparkles,
    description: "Базовий Altr для знайомства з персональною AI-моделлю.",
    features: ["1 джерело даних", "До 25 спогадів", "Базовий тон відповідей", "Ручні чернетки"],
  },
  {
    id: "personal", name: "Особиста", price: 20, originalPrice: 30, label: "PERSONAL", icon: Zap, popular: true,
    description: "Повний персональний Altr для щоденної роботи та комунікації.",
    features: ["Усі особисті джерела", "Розширена памʼять", "Автоматичні чернетки", "Усі стилі тону", "Щотижневі підсумки"],
  },
  {
    id: "work", name: "Робоча", price: 40, originalPrice: 60, label: "WORK", icon: UsersRound,
    description: "Максимальні можливості Altr для команд, клієнтів і процесів.",
    features: ["Усе з Особистого плану", "Командний простір", "Робочі інтеграції", "Спільний контекст команди", "Пріоритетна обробка", "Максимальна памʼять"],
  },
];

const featureNames: Record<string, string> = {
  calendar: "підключення календаря", messages: "підключення повідомлень", workspace: "командний простір",
  tone: "розширені стилі тону", drafts: "автоматичні чернетки", digest: "щотижневий підсумок",
};

export default function PricingPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<AltrProfile | null>(null);
  const [feature, setFeature] = useState("");
  const [changed, setChanged] = useState<PlanId | null>(null);

  useEffect(() => {
    setProfile(getCurrentProfile());
    setFeature(new URLSearchParams(window.location.search).get("feature") ?? "");
  }, []);

  const choosePlan = (plan: PlanId) => {
    if (!profile) {
      router.push("/auth?mode=register");
      return;
    }

    const update: Partial<AltrProfile> = { plan };
    if (plan === "free") {
      update.tone = "balanced";
      update.connections = { ...profile.connections, calendar: false, messages: false, workspace: false };
      update.preferences = { ...profile.preferences, autoDrafts: false, weeklyDigest: false };
    }
    if (plan === "personal") update.connections = { ...profile.connections, workspace: false };
    const next = updateCurrentProfile(update);
    if (next) setProfile(next);
    setChanged(plan);
    window.setTimeout(() => setChanged(null), 2200);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05080c] text-white">
      <div className="account-grid pointer-events-none fixed inset-0" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_5%,rgba(47,160,255,.14),transparent_34%),radial-gradient(circle_at_90%_70%,rgba(103,232,249,.055),transparent_30%)]" />

      <header className="relative z-20 mx-auto flex h-24 max-w-7xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold">Altr <AiMark /></Link>
        <Link href={profile ? "/dashboard" : "/"} className="inline-flex items-center gap-2 text-xs uppercase tracking-[.16em] text-white/42 transition hover:text-white"><ArrowLeft className="h-4 w-4" />{profile ? "До кабінету" : "На головну"}</Link>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-8 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="eyebrow">CHOOSE YOUR ALTR</p>
          <h1 className="mx-auto mt-5 max-w-4xl text-balance text-5xl font-medium leading-[.98] tracking-[-.065em] md:text-7xl">Обери рівень свого другого себе.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/42">Почни безкоштовно або відкрий більше памʼяті, автоматизації та робочих можливостей.</p>
        </motion.div>

        {feature && <div className="mx-auto mt-8 flex w-fit items-center gap-2 rounded-full border border-cyan-100/[.1] bg-cyan-200/[.04] px-4 py-2 text-sm text-cyan-50/60"><LockKeyhole className="h-4 w-4" />Для функції «{featureNames[feature] ?? "преміальна можливість"}» потрібен вищий план</div>}

        <div className="mt-12 grid gap-4 text-left lg:grid-cols-3">
          {plans.map((plan, index) => {
            const current = profile?.plan === plan.id;
            const Icon = plan.icon;
            return (
              <motion.article key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .08 }} className={`pricing-card relative flex min-h-[560px] flex-col rounded-[2rem] p-7 md:p-8 ${plan.popular ? "pricing-card-featured" : ""}`}>
                {plan.popular && <span className="absolute right-6 top-6 rounded-full border border-cyan-100/15 bg-cyan-200/[.08] px-3 py-1.5 text-[10px] uppercase tracking-[.18em] text-cyan-50/70">Найпопулярніша</span>}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-100/[.1] bg-cyan-200/[.04]"><Icon className="h-5 w-5 text-cyan-100/60" /></div>
                <p className="data-label mt-7">{plan.label}</p>
                <h2 className="mt-3 text-3xl font-medium tracking-[-.045em]">{plan.name}</h2>
                <p className="mt-4 min-h-[72px] text-sm leading-6 text-white/38">{plan.description}</p>
                <div className="mt-7 flex flex-wrap items-end gap-x-3 gap-y-2">
                  <span className="text-5xl font-medium tracking-[-.06em]">${plan.price}</span>
                  {plan.originalPrice && (
                    <span className="pb-2 text-2xl font-medium tracking-[-.05em] text-white/22 line-through decoration-cyan-100/35 decoration-2">
                      ${plan.originalPrice}
                    </span>
                  )}
                  <span className="pb-1.5 text-sm text-white/30">{plan.price ? "/ місяць" : "назавжди"}</span>
                  {plan.originalPrice && (
                    <span className="mb-1.5 rounded-full border border-cyan-100/15 bg-cyan-200/[.06] px-2.5 py-1 text-[10px] uppercase tracking-[.16em] text-cyan-50/55">
                      sale
                    </span>
                  )}
                </div>
                <div className="my-7 h-px bg-white/[.065]" />
                <ul className="space-y-3.5">{plan.features.map(item => <li key={item} className="flex items-start gap-3 text-sm text-white/55"><Check className="mt-0.5 h-4 w-4 flex-none text-cyan-100/55" />{item}</li>)}</ul>
                <button onClick={() => choosePlan(plan.id)} disabled={current} className={`${plan.popular ? "future-button" : "glass-button"} mt-auto flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm disabled:cursor-default disabled:opacity-60`}>
                  {changed === plan.id ? "План активовано" : current ? "Поточний план" : plan.price ? `Обрати за $${plan.price}` : "Обрати безкоштовний"}
                </button>
              </motion.article>
            );
          })}
        </div>
        <p className="mt-7 text-xs text-white/25">Ціни вказані за один акаунт на місяць. Змінити план можна будь-коли.</p>
      </section>
    </main>
  );
}
