import type { PlanId } from "@/lib/auth";

export type BillingPlan = {
  id: PlanId;
  name: string;
  label: string;
  price: number;
  originalPrice?: number;
  currency: "USD" | "UAH";
  description: string;
  features: string[];
  popular?: boolean;
  paid: boolean;
};

export const billingPlans: BillingPlan[] = [
  {
    id: "free",
    name: "Безкоштовна",
    label: "FREE",
    price: 0,
    currency: "USD",
    paid: false,
    description: "Базовий Altr для знайомства з персональною AI-моделлю.",
    features: ["1 джерело даних", "До 25 спогадів", "Базовий тон відповідей", "Ручні чернетки"],
  },
  {
    id: "personal",
    name: "Особиста",
    label: "PERSONAL",
    price: 20,
    originalPrice: 30,
    currency: "USD",
    paid: true,
    popular: true,
    description: "Повний персональний Altr для щоденної роботи та комунікації.",
    features: ["Усі особисті джерела", "Розширена памʼять", "Автоматичні чернетки", "Усі стилі тону", "Щотижневі підсумки"],
  },
  {
    id: "work",
    name: "Робоча",
    label: "WORK",
    price: 40,
    originalPrice: 60,
    currency: "USD",
    paid: true,
    description: "Максимальні можливості Altr для команд, клієнтів і процесів.",
    features: ["Усе з Особистого плану", "Командний простір", "Робочі інтеграції", "Спільний контекст команди", "Пріоритетна обробка", "Максимальна памʼять"],
  },
];

export function getBillingPlan(planId: PlanId) {
  return billingPlans.find((plan) => plan.id === planId) ?? billingPlans[0];
}
