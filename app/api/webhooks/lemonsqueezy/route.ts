import { NextRequest, NextResponse } from "next/server";
import { handleLemonWebhook } from "@/lib/billing/webhook-handler";

export async function POST(request: NextRequest) {
  const result = await handleLemonWebhook(request);
  return NextResponse.json(result.body, { status: result.status });
}
