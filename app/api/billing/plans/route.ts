import { NextResponse } from "next/server";
import { getCurrentPlanPricing } from "@/lib/billing/lemonsqueezy";
import { knownPlanDisplay, paidPlanIds } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const fallbackPricing = paidPlanIds.map((planId) => ({
  planId,
  amount: knownPlanDisplay[planId].amount,
  currency: knownPlanDisplay[planId].currency,
  interval: knownPlanDisplay[planId].interval,
  live: false,
}));

export async function GET() {
  try {
    const pricing = await getCurrentPlanPricing();
    return NextResponse.json({
      plans: pricing,
      notice: pricing.every((plan) => plan.live)
        ? null
        : "Displayed prices use known metadata. The final amount is confirmed in Lemon Squeezy checkout.",
    });
  } catch (error) {
    console.warn("Billing plans fallback is active", error);
    return NextResponse.json({
      plans: fallbackPricing,
      notice: "Displayed prices use known metadata. The final amount is confirmed in Lemon Squeezy checkout.",
    });
  }
}
