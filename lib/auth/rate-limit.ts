import "server-only";
import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AuthRateLimitAction = "register" | "login" | "forgot" | "reset";

const limits: Record<AuthRateLimitAction, { attempts: number; windowMinutes: number }> = {
  register: { attempts: 5, windowMinutes: 60 },
  login: { attempts: 10, windowMinutes: 15 },
  forgot: { attempts: 5, windowMinutes: 60 },
  reset: { attempts: 5, windowMinutes: 30 },
};

export function getRequestIdentity(request: NextRequest, email?: string) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return `${ip}|${email?.trim().toLowerCase() ?? "anonymous"}`;
}

export async function assertAuthRateLimit(action: AuthRateLimitAction, identity: string) {
  const config = limits[action];
  const admin = createSupabaseAdminClient();
  const identifierHash = createHash("sha256").update(identity).digest("hex");
  const since = new Date(Date.now() - config.windowMinutes * 60_000).toISOString();

  const { count, error } = await admin
    .from("altr_auth_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("action", action)
    .eq("identifier_hash", identifierHash)
    .gte("created_at", since);

  if (error) throw new Error("RATE_LIMIT_STORAGE_FAILED");
  if ((count ?? 0) >= config.attempts) throw new Error("RATE_LIMITED");

  const { error: insertError } = await admin.from("altr_auth_rate_limits").insert({
    action,
    identifier_hash: identifierHash,
  });
  if (insertError) throw new Error("RATE_LIMIT_STORAGE_FAILED");
}
