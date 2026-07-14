import { NextResponse } from "next/server";
import { createSupabaseAdminClient, requireUser } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: { orderId: string } }) {
  try {
    const user = await requireUser();
    const { data: invoice, error } = await createSupabaseAdminClient()
      .from("altr_billing_invoices")
      .select("provider_order_id,amount,currency,status,receipt_url,created_at,paid_at")
      .eq("user_id", user.id)
      .eq("provider", "lemon_squeezy")
      .eq("provider_order_id", params.orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ invoice: invoice ?? null });
  } catch (error) {
    return NextResponse.json(
      { invoice: null, error: error instanceof Error ? error.message : "RECEIPT_LOOKUP_FAILED" },
      { status: 401 },
    );
  }
}
