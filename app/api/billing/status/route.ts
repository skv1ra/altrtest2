import { NextResponse } from "next/server";
import { createSupabaseAdminClient, requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await requireUser();
    const { data: subscription, error } = await createSupabaseAdminClient()
      .from("altr_subscriptions")
      .select("plan,status,provider,renews_at,ends_at,updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    const active = subscription?.provider === "lemon_squeezy" && subscription.status === "active";
    return NextResponse.json({ active, subscription: subscription ?? null });
  } catch (error) {
    return NextResponse.json(
      {
        active: false,
        subscription: null,
        error: error instanceof Error ? error.message : "BILLING_STATUS_FAILED",
      },
      { status: 401 },
    );
  }
}
