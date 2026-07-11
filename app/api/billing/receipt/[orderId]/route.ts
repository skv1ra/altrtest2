import { NextRequest, NextResponse } from "next/server";
import { getInvoiceByOrderId, isSupabaseConfigured } from "@/lib/supabaseServer";

export async function GET(_request: NextRequest, { params }: { params: { orderId: string } }) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ configured: false, invoice: null });
  }

  try {
    const invoice = await getInvoiceByOrderId(params.orderId);
    return NextResponse.json({ configured: true, invoice });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to read receipt";
    return NextResponse.json({ configured: true, invoice: null, error: message }, { status: 500 });
  }
}
