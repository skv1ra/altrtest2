import { NextResponse } from "next/server";
import { getCurrentPlanPricing } from "@/lib/billing/lemonsqueezy";

export async function GET() {
  const pricing = await getCurrentPlanPricing();
  return NextResponse.json({
    plans: pricing,
    notice: pricing.every((plan) => plan.live)
      ? null
      : "Displayed prices use known metadata. The final amount is confirmed in Lemon Squeezy checkout.",
  });
}
