import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { getUserEntitlement } from "@/lib/billing/entitlements";

export async function GET() {
  try {
    const user = await requireUser();
    const entitlement = await getUserEntitlement(user.id);

    return NextResponse.json({
      active: entitlement.hasPremium,
      entitlement,
    });
  } catch (error) {
    return NextResponse.json(
      {
        active: false,
        entitlement: null,
        error: error instanceof Error ? error.message : "BILLING_STATUS_FAILED",
      },
      { status: 401 },
    );
  }
}
