import "server-only";
import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AuthRateLimitAction =
  | "register"
  | "login"
  | "forgot"
  | "reset"
  | "billing_checkout"
  | "billing_portal"
  | "ai_generation"
  | "import_create"
  | "import_chunk"
  | "memory_write"
  | "assistant_write"
  | "privacy_request"
  | "data_export"
  | "account_delete";

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  reset_at: string;
};

const limits: Record<AuthRateLimitAction, { attempts: number; windowSeconds: number }> = {
  register: { attempts: 5, windowSeconds: 60 * 60 },
  login: { attempts: 10, windowSeconds: 15 * 60 },
  forgot: { attempts: 5, windowSeconds: 60 * 60 },
  reset: { attempts: 5, windowSeconds: 30 * 60 },
  billing_checkout: { attempts: 8, windowSeconds: 15 * 60 },
  billing_portal: { attempts: 12, windowSeconds: 15 * 60 },
  ai_generation: { attempts: 30, windowSeconds: 60 * 60 },
  import_create: { attempts: 10, windowSeconds: 60 * 60 },
  import_chunk: { attempts: 120, windowSeconds: 60 * 60 },
  memory_write: { attempts: 60, windowSeconds: 60 * 60 },
  assistant_write: { attempts: 30, windowSeconds: 60 * 60 },
  privacy_request: { attempts: 5, windowSeconds: 60 * 60 },
  data_export: { attempts: 3, windowSeconds: 60 * 60 },
  account_delete: { attempts: 3, windowSeconds: 60 * 60 },
};

export function getRequestIdentity(request: NextRequest, subject?: string) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `${ip}|${subject?.trim().toLowerCase() ?? "anonymous"}`;
}

export async function assertAuthRateLimit(action: AuthRateLimitAction, identity: string) {
  const config = limits[action];
  const identifierHash = createHash("sha256").update(identity).digest("hex");
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .rpc("altr_consume_rate_limit", {
      p_action: action,
      p_identifier_hash: identifierHash,
      p_limit: config.attempts,
      p_window_seconds: config.windowSeconds,
    })
    .single();

  if (error || !data) throw new Error("RATE_LIMIT_STORAGE_FAILED");
  const result = data as RateLimitResult;
  if (!result.allowed) throw new Error("RATE_LIMITED");

  return {
    remaining: Number(result.remaining ?? 0),
    resetAt: String(result.reset_at),
  };
}
