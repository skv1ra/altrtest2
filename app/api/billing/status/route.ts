import { NextRequest, NextResponse } from "next/server";
import { getActiveSubscription, getPaymentByOrderId, isSupabaseConfigured } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const orderId = searchParams.get("orderId") || searchParams.get("order_id");

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ configured: false, active: false, message: "Supabase is not configured yet" });
  }

  try {
    const subscription = await getActiveSubscription({ email, orderId });
    const payment = orderId ? await getPaymentByOrderId(orderId) : null;
    const active = Boolean(subscription?.status === "active" && new Date(subscription.expires_at).getTime() > Date.now());

    return NextResponse.json({
      configured: true,
      active,
      subscription,
      payment,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to read billing status";
    return NextResponse.json({ configured: true, active: false, error: message }, { status: 500 });
  }
}
