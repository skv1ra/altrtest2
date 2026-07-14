import { NextResponse } from "next/server";
import { getFreshCustomerPortalUrl } from "@/lib/billing/lemonsqueezy";
import { createSupabaseAdminClient, requireUser } from "@/lib/supabase/server";

export async function POST() {
  try {
    const user = await requireUser();
    const { data, error } = await createSupabaseAdminClient()
      .from("altr_subscriptions")
      .select("provider_subscription_id")
      .eq("user_id", user.id)
      .eq("provider", "lemon_squeezy")
      .not("provider_subscription_id", "is", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data?.provider_subscription_id) {
      return NextResponse.json({ error: "SUBSCRIPTION_NOT_FOUND" }, { status: 404 });
    }

    const portalUrl = await getFreshCustomerPortalUrl(data.provider_subscription_id);
    return NextResponse.json({ portalUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PORTAL_FAILED";
    return NextResponse.json({ error: message }, { status: message === "UNAUTHORIZED" ? 401 : 500 });
  }
}
