import { NextResponse } from "next/server";
import { getUserEntitlement } from "@/lib/billing/entitlements";
import { createSupabaseAdminClient, requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await requireUser();
    const admin = createSupabaseAdminClient();
    const entitlement = await getUserEntitlement(user.id);
    const subscriptionResult = await admin
      .from("altr_subscriptions")
      .select("plan_id,status,renews_at,ends_at,trial_ends_at,cancelled,test_mode,provider_customer_id,provider_subscription_id,updated_at")
      .eq("user_id", user.id)
      .eq("provider", "lemon_squeezy")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const invoiceResult = await admin
      .from("altr_billing_invoices")
      .select("id,provider_invoice_id,provider_order_id,status,amount,currency,receipt_url,issued_at,paid_at,created_at")
      .eq("user_id", user.id)
      .eq("provider", "lemon_squeezy")
      .order("created_at", { ascending: false })
      .limit(20);

    if (subscriptionResult.error) throw subscriptionResult.error;
    if (invoiceResult.error) throw invoiceResult.error;

    const subscription = subscriptionResult.data;
    return NextResponse.json({
      effectivePlan: entitlement.planId,
      hasPremium: entitlement.hasPremium,
      entitlementReason: entitlement.reason,
      subscription: subscription ? {
        planId: subscription.plan_id,
        status: subscription.status,
        renewsAt: subscription.renews_at,
        endsAt: subscription.ends_at,
        trialEndsAt: subscription.trial_ends_at,
        cancelled: subscription.cancelled,
        testMode: subscription.test_mode,
        canManage: Boolean(subscription.provider_subscription_id || subscription.provider_customer_id),
      } : null,
      invoices: (invoiceResult.data ?? []).map((invoice) => ({
        id: invoice.id,
        invoiceId: invoice.provider_invoice_id,
        orderId: invoice.provider_order_id,
        status: invoice.status,
        amount: invoice.amount,
        currency: invoice.currency,
        receiptUrl: invoice.receipt_url,
        issuedAt: invoice.issued_at,
        paidAt: invoice.paid_at,
        createdAt: invoice.created_at,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "BILLING_ME_FAILED";
    return NextResponse.json({ error: message }, { status: message === "UNAUTHORIZED" ? 401 : 500 });
  }
}
