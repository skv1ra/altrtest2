import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { planFromVariantId, verifyWebhookSignature } from "@/lib/lemonSqueezy";

function textValue(value: unknown) {
  return value == null ? null : String(value);
}

function numberValue(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite