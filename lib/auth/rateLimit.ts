import "server-only";
import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const limits = {
  register: { windowSeconds: 3600, maxAttempts: 5 },
  login: { windowSeconds: 900, maxAttempts: 10 },
  forgot: { windowSeconds: 3600, maxAttempts: 5 },
  reset: { windowSeconds: 3600, maxAttempts: 5 },
} as const;

export type AuthRateLimitAction = keyof typeof limits;

function requestIdentity(request: NextRequest, email?: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`${ip}|${email?.trim().toLowerCase() ?? ""}`).digest("hex");
}

export async function assertAuthRateLimit(request: NextRequest, action: AuthRateLimitAction, email?: string) {
  const config = limits[action];
  const identifierHash = requestIdentity(request, email);
  const admin = createSupabaseAdminClient();
  const since = new Date(Date.now() - config.windowSeconds * 1000).toISOString();

  const { count, error } = await admin
    .from("altr_auth_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("action", action)
    .eq("identifier_hash", identifierHash)
    .gte("created_at", since);

  if (error) throw error;
  if ((count ?? 0) >= config.maxAttempts) throw new Error("RATE_LIMITED");

  const { error: insertError } = await admin.from("altr_auth_rate_limits").insert({ action, identifier_hash: identifierHash });
  if (insertError) throw insertError;
}
